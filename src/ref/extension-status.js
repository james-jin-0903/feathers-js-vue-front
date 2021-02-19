export default (code) => {

  if(!code){
    return 'negative';
  }

  if (code === '') {
    return '';
  }

  const statusReference = {
    'UNKNOWN': '', //Unknown
    'NOT_INUSE': '', //Idle
    'INUSE': 'active', //In use
    'BUSY': 'intermediary', //Busy (pulse)
    'INVALID': '',
    'UNAVAILABLE': 'negative', //Unavailable
    'RINGING': 'positive', //Ringing (pulse)
    'RINGINUSE': 'active', //in use on hold
    'ONHOLD': 'positive' //On Hold
  };

  return statusReference[code];

}