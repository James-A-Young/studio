import { connectToDatabase } from './mongo';
import { ClubModel } from './club.model';
import { MembershipModel } from './membership.model';
import { ClubRoleAssignmentModel } from './clubRole.model';
import { AttendanceModel } from './attendance.model';
import { MembershipRequestModel } from './membershipRequest.model';
import { Types } from 'mongoose';

export class ClubRepository {
  async getClubById(clubId: string) {
    await connectToDatabase();
    return ClubModel.findById(clubId);
  }

  async addMember(userId: string, clubId: string, startDate: Date) {
    await connectToDatabase();
    return MembershipModel.create({ user: userId, club: clubId, startDate });
  }

  async getMembers(clubId: string) {
    await connectToDatabase();
    return MembershipModel.find({ club: clubId });
  }

  async assignRole(userId: string, clubId: string, role: string, startDate: Date, endDate?: Date) {
    await connectToDatabase();
    return ClubRoleAssignmentModel.create({ user: userId, club: clubId, role, startDate, endDate });
  }

  async getRoles(clubId: string) {
    await connectToDatabase();
    return ClubRoleAssignmentModel.find({ club: clubId });
  }

  async createAttendance(userId: string, clubId: string, timeIn: Date, reason: string, options?: { timeOut?: Date, clubRepresented?: string, firearmUsed?: string }) {
    await connectToDatabase();
    return AttendanceModel.create({
      user: userId,
      club: clubId,
      timeIn,
      timeOut: options?.timeOut,
      reason,
      clubRepresented: options?.clubRepresented,
      firearmUsed: options?.firearmUsed
    });
  }

  async getAttendance(clubId: string, from?: Date, to?: Date) {
    await connectToDatabase();
    const query: any = { club: clubId };
    if (from || to) {
      query.timeIn = {};
      if (from) query.timeIn.$gte = from;
      if (to) query.timeIn.$lte = to;
    }
    return AttendanceModel.find(query);
  }

  async createMembershipRequest(userId: string, clubId: string) {
    await connectToDatabase();
    return MembershipRequestModel.create({ user: userId, club: clubId });
  }

  async getPendingMembershipRequests(clubId: string) {
    await connectToDatabase();
    return MembershipRequestModel.find({ club: clubId, status: 'pending' });
  }

  async decideMembershipRequest(requestId: string, status: 'accepted' | 'rejected', decidedBy: string, reason?: string) {
    await connectToDatabase();
    return MembershipRequestModel.findByIdAndUpdate(
      requestId,
      { status, decidedBy, decidedAt: new Date(), reason },
      { new: true }
    );
  }
}
