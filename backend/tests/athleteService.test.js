jest.mock('../src/models/athleteModel');

const athleteModel = require('../src/models/athleteModel');
const athleteService = require('../src/services/athleteService');

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);

describe('athleteService.sniffImageType', () => {
  it('recognises JPEG, PNG and WebP from their first bytes', () => {
    expect(athleteService.sniffImageType(JPEG)).toBe('image/jpeg');
    expect(athleteService.sniffImageType(PNG)).toBe('image/png');
    expect(athleteService.sniffImageType(WEBP)).toBe('image/webp');
  });

  it('refuses anything else, whatever the Content-Type header claimed', () => {
    expect(athleteService.sniffImageType(Buffer.from('<svg onload="alert(1)">'))).toBeNull();
    expect(athleteService.sniffImageType(Buffer.from('GIF89a'))).toBeNull();
  });
});

describe('athleteService.setPhoto', () => {
  beforeEach(() => jest.clearAllMocks());

  it('stores the sniffed type, not the declared one', async () => {
    athleteModel.findById.mockResolvedValue({ id: 3 });
    await athleteService.setPhoto('3', PNG);
    expect(athleteModel.savePhoto).toHaveBeenCalledWith(3, 'image/png', PNG);
  });

  it('rejects an empty or non-image body, and an unknown athlete', async () => {
    athleteModel.findById.mockResolvedValue({ id: 3 });
    await expect(athleteService.setPhoto('3', {})).rejects.toMatchObject({ status: 400 });
    await expect(athleteService.setPhoto('3', Buffer.from('hello'))).rejects.toMatchObject({ status: 400 });
    athleteModel.findById.mockResolvedValue(null);
    await expect(athleteService.setPhoto('3', JPEG)).rejects.toMatchObject({ status: 404 });
    expect(athleteModel.savePhoto).not.toHaveBeenCalled();
  });
});

describe('athleteService.update', () => {
  beforeEach(() => jest.clearAllMocks());

  it("ignores the uploaded photo's own URL sent back unchanged", async () => {
    athleteModel.update.mockResolvedValue({ id: 3 });
    await athleteService.update('3', { first_name: 'Léa', photo_url: '/api/athletes/3/photo?v=123' });
    expect(athleteModel.update).toHaveBeenCalledWith('3', { first_name: 'Léa' });
  });

  it('still rejects a non-http(s) photo_url', async () => {
    await expect(athleteService.update('3', { photo_url: 'javascript:alert(1)' })).rejects.toMatchObject({
      status: 400,
    });
  });
});
