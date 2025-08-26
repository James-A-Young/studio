import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ClubRepository } from '../../src/db/club.repository';
import { ClubModel } from '../../src/db/club.model';
import { UserModel } from '../../src/db/user.model';
import { MembershipModel } from '../../src/db/membership.model';
import { ClubRoleAssignmentModel } from '../../src/db/clubRole.model';
import { AttendanceModel } from '../../src/db/attendance.model';
import { MembershipRequestModel } from '../../src/db/membershipRequest.model';

jest.setTimeout(20000);
describe('ClubRepository', () => {
  let mongoServer: MongoMemoryServer;
  let repo: ClubRepository;
  let userId: string;
  let clubId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repo = new ClubRepository();
    // Create a user and a club for tests
    const user = await UserModel.create({ email: 'member@example.com', displayName: 'Member' });
    userId = user._id.toString();
    const club = await ClubModel.create({ name: 'Test Club', address: '123 Main St', contactEmail: 'contact@testclub.com', disciplines: [], ranges: [] });
    clubId = club._id.toString();
  });

  afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
  });

  afterEach(async () => {
    await MembershipModel.deleteMany({});
    await ClubRoleAssignmentModel.deleteMany({});
    await AttendanceModel.deleteMany({});
    await MembershipRequestModel.deleteMany({});
  });

  it('should add and get members', async () => {
    await repo.addMember(userId, clubId, new Date('2023-01-01'));
    const members = await repo.getMembers(clubId);
    expect(members.length).toBe(1);
    expect(members[0].user.toString()).toBe(userId);
  });

  it('should assign and get roles', async () => {
    await repo.assignRole(userId, clubId, 'manager', new Date('2023-01-01'));
    const roles = await repo.getRoles(clubId);
    expect(roles.length).toBe(1);
    expect(roles[0].role).toBe('manager');
  });

  it('should create and get attendance', async () => {
    await repo.createAttendance(userId, clubId, new Date('2023-01-01T10:00:00Z'), 'Practice');
    const attendance = await repo.getAttendance(clubId);
    expect(attendance.length).toBe(1);
    expect(attendance[0].reason).toBe('Practice');
  });

  it('should create and get pending membership requests', async () => {
    await repo.createMembershipRequest(userId, clubId);
    const requests = await repo.getPendingMembershipRequests(clubId);
    expect(requests.length).toBe(1);
    expect(requests[0].status).toBe('pending');
  });

  it('should accept a membership request', async () => {
    const req = await repo.createMembershipRequest(userId, clubId);
    const decided = await repo.decideMembershipRequest(req._id.toString(), 'accepted', userId);
    expect(decided!.status).toBe('accepted');
    expect(decided!.decidedBy.toString()).toBe(userId);
  });
});
