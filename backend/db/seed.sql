-- BoxTrack - Core V1 demo seed
-- One coach account + 7 realistic sessions (today and the 6 days before it,
-- so GET /api/wods/today always resolves right after seeding) covering every
-- supported WOD format at least once.
--
-- Demo coach login: coach@crossfitlab.fr / CoachDemo2026!

BEGIN;

INSERT INTO users (email, password_hash, role)
VALUES ('coach@crossfitlab.fr', '$2b$10$ZHRW5GBQ4rO9gsPipqz6K./DjNjF06fqelyIkSxrC41RJd6SpSxeq', 'coach');

-- Day -6: STRENGTH
WITH new_wod AS (
    INSERT INTO wods (session_date, time_slot, warmup_general, warmup_specific, created_by)
    VALUES (
        CURRENT_DATE - INTERVAL '6 day',
        '18:00',
        '5 min bike + dynamic mobility (hips, ankles, shoulders)',
        'Empty barbell: 2x5 back squat, 2x5 good morning',
        (SELECT id FROM users WHERE email = 'coach@crossfitlab.fr')
    )
    RETURNING id
), ss AS (
    INSERT INTO skill_strength_blocks (wod_id, kind, instructions)
    SELECT id, 'strength', 'Build to a heavy but technically solid set of 5. Rest 2-3 min between sets.'
    FROM new_wod
    RETURNING wod_id
)
INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes)
SELECT id, 'STRENGTH', '5x5', 'Focus on depth and bar speed out of the hole, not just the number on the bar.'
FROM new_wod;

INSERT INTO movements (wod_id, phase, movement_name, detail, order_index)
SELECT id, 'skill_strength', 'Back Squat', '5-5-5-5-5, building', 0 FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '6 day';
INSERT INTO movements (wod_id, phase, movement_name, detail, order_index)
SELECT id, 'wod', 'Back Squat', 'Top set of 5 at the heaviest load from Skill/Strength', 0 FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '6 day';

-- Day -5: AMRAP
WITH new_wod AS (
    INSERT INTO wods (session_date, time_slot, warmup_general, warmup_specific, created_by)
    VALUES (
        CURRENT_DATE - INTERVAL '5 day',
        '18:00',
        '3 min row + arm circles + air squats',
        '2 rounds: 5 pull-up progressions, 5 box step-ups',
        (SELECT id FROM users WHERE email = 'coach@crossfitlab.fr')
    )
    RETURNING id
), ss AS (
    INSERT INTO skill_strength_blocks (wod_id, kind, instructions)
    SELECT id, 'skill', 'Kipping pull-up drills - focus on the hollow/arch swing before adding reps.'
    FROM new_wod
    RETURNING wod_id
)
INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes)
SELECT id, 'AMRAP', '20 min', 'Pace the pull-ups from round 1 - this one is a grind, not a sprint.'
FROM new_wod;

INSERT INTO movements (wod_id, phase, movement_name, detail, order_index)
SELECT id, 'skill_strength', 'Kipping Pull-Up', '3 sets of 5, strict-to-kip drill', 0 FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '5 day';
INSERT INTO movements (wod_id, phase, movement_name, detail, order_index) VALUES
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '5 day'), 'wod', 'Pull-Up', '5 reps', 0),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '5 day'), 'wod', 'Push-Up', '10 reps', 1),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '5 day'), 'wod', 'Air Squat', '15 reps', 2);

-- Day -4: FOR TIME
WITH new_wod AS (
    INSERT INTO wods (session_date, time_slot, warmup_general, warmup_specific, created_by)
    VALUES (
        CURRENT_DATE - INTERVAL '4 day',
        '18:00',
        '400m jog + leg swings',
        'Empty barbell thrusters x10, light pull-up practice',
        (SELECT id FROM users WHERE email = 'coach@crossfitlab.fr')
    )
    RETURNING id
), ss AS (
    INSERT INTO skill_strength_blocks (wod_id, kind, instructions)
    SELECT id, 'skill', 'Thruster technique under fatigue - 3 sets of 5 at a moderate, unbroken pace.'
    FROM new_wod
    RETURNING wod_id
)
INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes)
SELECT id, 'FOR_TIME', '21-15-9', 'Classic couplet. Scale the load so unbroken thrusters stay realistic.'
FROM new_wod;

INSERT INTO movements (wod_id, phase, movement_name, detail, order_index)
SELECT id, 'skill_strength', 'Thruster', '3x5 @ moderate load', 0 FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '4 day';
INSERT INTO movements (wod_id, phase, movement_name, detail, order_index) VALUES
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '4 day'), 'wod', 'Thruster', '42.5/30 kg', 0),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '4 day'), 'wod', 'Pull-Up', '', 1);

-- Day -3: EMOM
WITH new_wod AS (
    INSERT INTO wods (session_date, time_slot, warmup_general, warmup_specific, created_by)
    VALUES (
        CURRENT_DATE - INTERVAL '3 day',
        '18:00',
        '3 min jump rope + hip openers',
        'Light snatch pulls x5, 2 rounds',
        (SELECT id FROM users WHERE email = 'coach@crossfitlab.fr')
    )
    RETURNING id
), ss AS (
    INSERT INTO skill_strength_blocks (wod_id, kind, instructions)
    SELECT id, 'skill', 'Power snatch positional work - focus on the pull under the bar, not the load.'
    FROM new_wod
    RETURNING wod_id
)
INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes)
SELECT id, 'EMOM', '12 min (alternating)', 'Odd minutes: snatches. Even minutes: burpees. Rest is the reward for finishing early.'
FROM new_wod;

INSERT INTO movements (wod_id, phase, movement_name, detail, order_index)
SELECT id, 'skill_strength', 'Power Snatch', '5x3, building', 0 FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '3 day';
INSERT INTO movements (wod_id, phase, movement_name, detail, order_index) VALUES
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '3 day'), 'wod', 'Power Snatch', '3 reps @ 40 kg (odd minutes)', 0),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '3 day'), 'wod', 'Burpee', '8 reps (even minutes)', 1);

-- Day -2: TABATA
WITH new_wod AS (
    INSERT INTO wods (session_date, time_slot, warmup_general, warmup_specific, created_by)
    VALUES (
        CURRENT_DATE - INTERVAL '2 day',
        '18:00',
        '3 min row easy + dynamic stretching',
        '1 round of each movement at low intensity to rehearse the switches',
        (SELECT id FROM users WHERE email = 'coach@crossfitlab.fr')
    )
    RETURNING id
), ss AS (
    INSERT INTO skill_strength_blocks (wod_id, kind, instructions)
    SELECT id, 'skill', 'Air squat and sit-up pacing drill - find a cadence you can hold for 8 rounds.'
    FROM new_wod
    RETURNING wod_id
)
INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes)
SELECT id, 'TABATA', '4 movements x 4 min each', '20s work / 10s rest x 8 rounds per movement, straight into the next.'
FROM new_wod;

INSERT INTO movements (wod_id, phase, movement_name, detail, order_index)
SELECT id, 'skill_strength', 'Air Squat + Sit-Up pacing', 'steady, sustainable cadence', 0 FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '2 day';
INSERT INTO movements (wod_id, phase, movement_name, detail, order_index) VALUES
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '2 day'), 'wod', 'Air Squat', '8 rounds', 0),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '2 day'), 'wod', 'Sit-Up', '8 rounds', 1),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '2 day'), 'wod', 'Push-Up', '8 rounds', 2),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '2 day'), 'wod', 'Mountain Climber', '8 rounds (count as 2 reps)', 3);

-- Day -1: CHIPPER
WITH new_wod AS (
    INSERT INTO wods (session_date, time_slot, warmup_general, warmup_specific, created_by)
    VALUES (
        CURRENT_DATE - INTERVAL '1 day',
        '18:00',
        '500m row + mobility flow',
        'Light box jump step-ups x10, empty-bar OHS x5',
        (SELECT id FROM users WHERE email = 'coach@crossfitlab.fr')
    )
    RETURNING id
), ss AS (
    INSERT INTO skill_strength_blocks (wod_id, kind, instructions)
    SELECT id, 'skill', 'Overhead squat mobility and bar path - light load, focus on the bottom position.'
    FROM new_wod
    RETURNING wod_id
)
INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes)
SELECT id, 'CHIPPER', 'As fast as possible, once through', 'Break up the box jumps early - don''t chase unbroken sets on a chipper this long.'
FROM new_wod;

INSERT INTO movements (wod_id, phase, movement_name, detail, order_index)
SELECT id, 'skill_strength', 'Overhead Squat', '3x5 @ light load', 0 FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '1 day';
INSERT INTO movements (wod_id, phase, movement_name, detail, order_index) VALUES
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '1 day'), 'wod', 'Box Jump', '50 reps @ 24/20 in', 0),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '1 day'), 'wod', 'Pull-Up', '40 reps', 1),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '1 day'), 'wod', 'Kettlebell Swing', '30 reps @ 24/16 kg', 2),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '1 day'), 'wod', 'Overhead Squat', '20 reps @ 30/20 kg', 3),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE - INTERVAL '1 day'), 'wod', 'Bar Muscle-Up', '10 reps', 4);

-- Today: AMRAP
WITH new_wod AS (
    INSERT INTO wods (session_date, time_slot, warmup_general, warmup_specific, created_by)
    VALUES (
        CURRENT_DATE,
        '18:00',
        '400m run + shoulder/hip mobility',
        '2 rounds: 5 deadlift (empty bar), 5 burpee, easy pace',
        (SELECT id FROM users WHERE email = 'coach@crossfitlab.fr')
    )
    RETURNING id
), ss AS (
    INSERT INTO skill_strength_blocks (wod_id, kind, instructions)
    SELECT id, 'strength', 'Deadlift technique - neutral spine, bar close to the shins throughout the pull.'
    FROM new_wod
    RETURNING wod_id
)
INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes)
SELECT id, 'AMRAP', '15 min', 'Short and intense - pick a round pace you can hold from minute 1.'
FROM new_wod;

INSERT INTO movements (wod_id, phase, movement_name, detail, order_index)
SELECT id, 'skill_strength', 'Deadlift', '3x5, moderate load', 0 FROM wods WHERE session_date = CURRENT_DATE AND time_slot = '18:00';
INSERT INTO movements (wod_id, phase, movement_name, detail, order_index) VALUES
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE AND time_slot = '18:00'), 'wod', 'Deadlift', '10 reps @ 60/40 kg', 0),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE AND time_slot = '18:00'), 'wod', 'Burpee', '10 reps', 1),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE AND time_slot = '18:00'), 'wod', 'Box Jump', '10 reps @ 24/20 in', 2);

-- Today, second slot: demonstrates that a date can hold more than one
-- session (date, time_slot) is the real uniqueness key, not date alone.
WITH new_wod AS (
    INSERT INTO wods (session_date, time_slot, warmup_general, warmup_specific, created_by)
    VALUES (
        CURRENT_DATE,
        '06:00',
        '3 min easy bike + arm circles',
        'Empty-bar press x10, light row intervals',
        (SELECT id FROM users WHERE email = 'coach@crossfitlab.fr')
    )
    RETURNING id
), ss AS (
    INSERT INTO skill_strength_blocks (wod_id, kind, instructions)
    SELECT id, 'skill', 'Strict press technique - brace before every rep, no leg drive.'
    FROM new_wod
    RETURNING wod_id
)
INSERT INTO wod_blocks (wod_id, format, duration_or_target, notes)
SELECT id, 'EMOM', '10 min', 'Early class, smaller/faster format on purpose.'
FROM new_wod;

INSERT INTO movements (wod_id, phase, movement_name, detail, order_index)
SELECT id, 'skill_strength', 'Strict Press', '3x5 @ light load', 0 FROM wods WHERE session_date = CURRENT_DATE AND time_slot = '06:00';
INSERT INTO movements (wod_id, phase, movement_name, detail, order_index) VALUES
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE AND time_slot = '06:00'), 'wod', 'Row', '15 cal', 0),
    ((SELECT id FROM wods WHERE session_date = CURRENT_DATE AND time_slot = '06:00'), 'wod', 'Strict Press', '8 reps @ 30/20 kg', 1);

COMMIT;
