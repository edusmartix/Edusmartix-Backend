// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';

// @Injectable()
// export class TeacherGuard implements CanActivate {
//   constructor(private prisma: PrismaService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user; // From AuthGuard
//     const { armId, classSubjectId } = request.params;

//     // 1. Get the user's StaffProfile ID
//     const staff = await this.prisma.staffProfile.findUnique({
//       where: { userId: user.id },
//     });

//     if (!staff) return false;

//     // 2. If accessing a Class Arm (e.g. for Attendance)
//     if (armId) {
//       const isClassTeacher = await this.prisma.classArm.findFirst({
//         where: { id: Number(armId), classTeacherId: staff.id },
//       });
//       if (isClassTeacher) return true;
//     }

//     // 3. If accessing a Subject (e.g. for Scores)
//     if (classSubjectId) {
//       const isSubjectTeacher = await this.prisma.classSubject.findFirst({
//         where: { id: Number(classSubjectId), teacherId: staff.id },
//       });
//       if (isSubjectTeacher) return true;
//     }

//     return false;
//   }
// }
