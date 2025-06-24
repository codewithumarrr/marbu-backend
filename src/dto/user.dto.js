// src/dto/user.dto.js

function userToDTO(user) {
  if (!user) return null;
  return {
    id: user.id,
    employeeNumber: user.employeeNumber,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

module.exports = { userToDTO };