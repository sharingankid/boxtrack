const pool = require('../config/db');

function assemble(recipeRow, categoryRows) {
  return {
    id: recipeRow.id,
    spoonacular_id: recipeRow.spoonacular_id,
    name: recipeRow.name,
    calorie: recipeRow.calorie,
    image_url: recipeRow.image_url,
    categories: categoryRows.map((c) => ({ name: c.name })),
    created_by: recipeRow.created_by,
    created_at: recipeRow.created_at,
    updated_at: recipeRow.updated_at,
  };
}

async function fetchFull(client, recipeId) {
  const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
  const recipeRow = recipeResult.rows[0];
  if (!recipeRow) return null;

  const categoriesResult = await client.query(
    'SELECT * FROM recipe_categories WHERE recipe_id = $1 ORDER BY id',
    [recipeId]
  );
  return assemble(recipeRow, categoriesResult.rows);
}

async function findById(id) {
  return fetchFull(pool, id);
}

async function list() {
  const { rows } = await pool.query('SELECT id FROM recipes ORDER BY created_at DESC');
  const recipes = [];
  for (const row of rows) {
    recipes.push(await fetchFull(pool, row.id));
  }
  return recipes;
}

async function insertCategories(client, recipeId, categories = []) {
  for (const category of categories) {
    const name = typeof category === 'string' ? category : category.name;
    // eslint-disable-next-line no-await-in-loop
    await client.query('INSERT INTO recipe_categories (recipe_id, name) VALUES ($1, $2)', [recipeId, name]);
  }
}

async function create(data, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insert = await client.query(
      `INSERT INTO recipes (spoonacular_id, name, calorie, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [data.spoonacular_id || null, data.name, data.calorie, data.image_url || null, userId]
    );
    const recipeId = insert.rows[0].id;

    await insertCategories(client, recipeId, data.categories);

    const created = await fetchFull(client, recipeId);
    await client.query('COMMIT');
    return created;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function update(id, data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM recipes WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }

    const fields = [];
    const values = [];
    if (data.name !== undefined) {
      values.push(data.name);
      fields.push(`name = $${values.length}`);
    }
    if (data.calorie !== undefined) {
      values.push(data.calorie);
      fields.push(`calorie = $${values.length}`);
    }
    if (data.image_url !== undefined) {
      values.push(data.image_url);
      fields.push(`image_url = $${values.length}`);
    }

    values.push(id);
    const setClause = fields.length ? `${fields.join(', ')}, updated_at = now()` : 'updated_at = now()';
    await client.query(`UPDATE recipes SET ${setClause} WHERE id = $${values.length}`, values);

    if (data.categories !== undefined) {
      await client.query('DELETE FROM recipe_categories WHERE recipe_id = $1', [id]);
      await insertCategories(client, id, data.categories);
    }

    const updated = await fetchFull(client, id);
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findById, list, create, update, remove };
