import {UserStatus} from '../types/users.types';

// export const statusStyles = (status: UserStatus): string => {
//   switch (status) {
//     case UserStatus.ACTIVE:
//       return "bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-300";
//     case UserStatus.INACTIVE:
//       return "bg-gray-100/80 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300";
//     case UserStatus.SUSPENDED:
//       return "bg-orange-100/80 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
//     case UserStatus.DELETED:
//       return "bg-red-100/80 dark:bg-red-900/30 text-red-800 dark:text-red-300";
//     default:
//       return "bg-red-100/80 dark:bg-red-900/30 text-red-800 dark:text-red-300";
//   }
// };
export const statusStyles = (status: UserStatus) => {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case UserStatus.INACTIVE:
      return 'bg-yellow-100 text-yellow-800';
    case UserStatus.SUSPENDED:
      return 'bg-orange-100 text-orange-800';
    case UserStatus.DELETED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
