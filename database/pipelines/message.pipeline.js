module.exports = {
  $lookup: {
    from: "messages",
    as: "messages",
    let: { entity: "$id" },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [{ $eq: ["$entity", "$$entity"] }],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "id",
          as: "users",
        },
      },
      {
        $addFields: {
          userName: {
            $first: "$users.name",
          },
          userProfilePicture: {
            $first: "$users.avatarUrl",
          },
        },
      },
      {
        $unset: ["users", "__v", "_id", "deleted", "deletedOn", "deletedBy"],
      },
    ],
  },
};
