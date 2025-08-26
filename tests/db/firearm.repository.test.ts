import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { FirearmRepository } from '../../src/db/firearm.repository';
import { FirearmModel } from '../../src/db/firearm.model';

describe('FirearmRepository', () => {
  let mongoServer: MongoMemoryServer;
  let repo: FirearmRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repo = new FirearmRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await FirearmModel.deleteMany({});
  });

  it('should create and get a firearm', async () => {
    const firearm = await repo.createFirearm({ name: 'Test Rifle', calibre: '22LR', type: 'rifle' });
    expect(firearm.name).toBe('Test Rifle');
    const found = await repo.getFirearmById(firearm._id.toString());
    expect(found).not.toBeNull();
    expect(found!.calibre).toBe('22LR');
  });

  it('should update a firearm', async () => {
    const firearm = await repo.createFirearm({ name: 'Old', calibre: '9mm', type: 'pistol' });
    const updated = await repo.updateFirearm(firearm._id.toString(), { name: 'New' });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe('New');
  });

  it('should delete a firearm', async () => {
    const firearm = await repo.createFirearm({ name: 'DeleteMe', calibre: '12G', type: 'shotgun' });
    await repo.deleteFirearm(firearm._id.toString());
    const found = await repo.getFirearmById(firearm._id.toString());
    expect(found).toBeNull();
  });

  it('should list all firearms', async () => {
    await repo.createFirearm({ name: 'A', calibre: '22LR', type: 'rifle' });
    await repo.createFirearm({ name: 'B', calibre: '9mm', type: 'pistol' });
    const all = await repo.listAllFirearms();
    expect(all.length).toBe(2);
  });
});
