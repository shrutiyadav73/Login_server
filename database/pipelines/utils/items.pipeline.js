module.exports = [
  {
    $unwind: "$items",
  },
  {
    $lookup: {
      from: "items",
      let: {
        ipn: "$items.ipn",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$ipn", "$$ipn"],
            },
          },
        },
        {
          $unset: [
            "deletedOn",
            "deletedBy",
            "createdOn",
            "updatedOn",
            "createdBy",
            "updatedBy",
            "deleted",
            "_id",
            "manufacturer",
          ],
        },
      ],
      as: "itemsDetails",
    },
  },
  {
    $unwind: {
      path: "$itemsDetails",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: "$_id",

      purchaseRequestDetails: {
        $first: "$$ROOT",
      },

      items: {
        $push: {
          $mergeObjects: ["$itemsDetails", "$items"],
        },
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          "$purchaseRequestDetails",
          {
            items: "$items",
          },
        ],
      },
    },
  },
  {
    $project: {
      purchaseRequestDetails: 0,
      itemsDetails: 0,
    },
  },
];
