export default (reason) => {

  switch (reason) {
    case 'Break':
      return 'break';
    case 'Lunch':
      return 'lunch';
    case 'Account Review':
      return 'account-review';
    case 'Personal':
      return 'personal';
    case 'Meeting':
      return 'meeting';
    default:
      return 'pause-2';
  }

}