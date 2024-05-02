function list(query = {}) {
  return [
    {
      $match: {
        ...query,
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "name",
        as: "role",
      },
    },
    {
      $addFields: {
        permissions: {
          $first: "$role.permission",
        },
        role: {
          $first: "$role.name",
        },
      },
    },
    {
      $unset: ["__v", "_id", "createdBy", "updatedBy"],
    },
  ];
}

function generalList(query = {}) {
  return [
    {
      $match: {
        status: { $ne: "deleted" },
        ...query,
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "id",
        as: "roles",
      },
    },
    {
      $addFields: {
        role: {
          $first: "$roles.name",
        },
      },
    },
    {
      $unset: ["_id", "__v", "roles", "password"],
    },
  ];
}

function userAndRolePipeline(query = {}) {
  return [
    {
      $match: {
        status: { $ne: "deleted" },
        ...query,
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "id",
        as: "roles",
      },
    },
    {
      $addFields: {
        permissions: {
          $first: "$roles.permission",
        },
        role: {
          $first: "$roles.name",
        },
      },
    },
    {
      $unset: ["_id", "__v", "roles"],
    },
  ];
}

module.exports = { list, generalList, userAndRolePipeline };
