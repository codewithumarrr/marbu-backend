// src/dto/user.dto.js

function userToDTO(user) {
  if (!user) return null;
  return {
    user_id: user.user_id,
    employee_id: user.employee_id, // for backward compatibility
    employee_number: user.employee_number,
    employee_name: user.employee_name,
    role_id: user.role_id,
    mobile_number: user.mobile_number,
    site_id: user.site_id,
    qatar_id_number: user.qatar_id_number,
    profession: user.profession,
    user_picture: user.user_picture,
    role: user.roles ? user.roles.role_name : undefined,
    site: user.sites ? user.sites.site_name : undefined,
    tanks: user.sites ? user.sites.tanks : undefined
  };
}

module.exports = { userToDTO };
