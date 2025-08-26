import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { UserRepository } from '../../src/db/user.repository';
import { UserModel } from '../../src/db/user.model';

describe('UserRepository', () => {
  let mongoServer: MongoMemoryServer;
  let repo: UserRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repo = new UserRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  it('should create and find a user by email', async () => {
    const user = await repo.createUser({ email: 'test@example.com', displayName: 'Test User' });
    expect(user.email).toBe('test@example.com');
    const found = await repo.findByEmail('test@example.com');
    expect(found).not.toBeNull();
    expect(found!.displayName).toBe('Test User');
  });

  it('should update a user', async () => {
    const user = await repo.createUser({ email: 'update@example.com', displayName: 'Old Name' }) as mongoose.Document & { _id: mongoose.Types.ObjectId, displayName: string, email: string };
    const updated = await repo.updateUser(user._id.toString(), { displayName: 'New Name' });
    expect(updated).not.toBeNull();
    expect(updated!.displayName).toBe('New Name');
  });

  it('should return null for non-existent user', async () => {
    const found = await repo.findByEmail('nope@example.com');
    expect(found).toBeNull();
  });
});
