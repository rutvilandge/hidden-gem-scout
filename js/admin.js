window.HGS_ADMIN_EMAILS = ['rutvilandge@gmail.com'];

window.isHgsAdmin = (user) => {
  if (!user || !user.email) {
    return false;
  }
  return window.HGS_ADMIN_EMAILS.includes(user.email.toLowerCase());
};
