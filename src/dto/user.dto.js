// src/dto/user.dto.js

function userToDTO(user) {
  if (!user) return null;
  return {
    id: user.employee_id,
    employeeNumber: user.employee_number,
    name: user.employee_name,
    role: user.roles ? user.roles.role_name : undefined,
    roleId: user.role_id,
    mobile_number: user.mobile_number,
    site_id: user.site_id,
    site: user.sites ? user.sites.site_name : undefined,
    tanks: user.sites ? user.sites.tanks : undefined
  };
}

module.exports = { userToDTO };
