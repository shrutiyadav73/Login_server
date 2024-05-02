function list(query = {}) {
  return [
    {
      $match: {
        status: { $ne: "deleted" },
        ...query,
      },
    },
    {
      $lookup: {
        from: "purchase_quotations",
        localField: "quotationId",
        foreignField: "id",
        as: "quotationDetails",
      },
    },
    // {
    //   $unwind: {
    //     path: "$quotationDetails",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },

    {
      $lookup: {
        from: "purchase_requests",
        localField: "prId",
        foreignField: "id",
        as: "pr",
      },
    },
    {
      $unwind: {
        path: "$pr",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "pr.indentor",
        foreignField: "id",
        as: "pr.indentor_user",
      },
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "pr.deliverTo",
        foreignField: "id",
        as: "warehouse",
      },
    },
    {
      $addFields: {
        warehouseName: {
          $first: "$warehouse.name",
        },
      },
    },
    {
      $unwind: {
        path: "$pr.indentor_user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "clients",
        localField: "pr.clientId",
        foreignField: "id",
        as: "pr.client",
      },
    },
    {
      $unwind: {
        path: "$pr.client",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "pr.projectId",
        foreignField: "id",
        as: "pr.project",
      },
    },
    {
      $unwind: {
        path: "$pr.project",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "vendors",
        localField: "vendorId",
        foreignField: "id",
        as: "vendor",
      },
    },
    {
      $unwind: {
        path: "$vendor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "poApproverId",
        foreignField: "id",
        as: "poApproverUser",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "poVerifierId",
        foreignField: "id",
        as: "poVerifierUser",
      },
    },
    {
      ...require("../message.pipeline"),
    },
    ...require("../utils/items.pipeline"),

    {
      $addFields: {
        poApprover: {
          $first: "$poApproverUser.name",
        },
        poApproverUser: {
          $first: "$poApproverUser",
        },
        poVerifier: {
          $first: "$poVerifierUser.name",
        },
        poVerifierUser: {
          $first: "$poVerifierUser",
        },
      },
    },
    {
      $unset: ["__v", "-id", "pr.__v", "pr._id", "vendor.__v", "vendor._id"],
    },
  ];
}

function generalList(query = {}) {
  return [
    {
      $match: {
        status: {
          $ne: "deleted",
        },
        ...query,
      },
    },

    {
      $lookup: {
        from: "purchase_quotations",
        localField: "quotationId",
        foreignField: "id",
        as: "quotationDetails",
      },
    },

    {
      $unwind: {
        path: "$quotationDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "purchase_requests",
        localField: "prId",
        foreignField: "id",
        as: "pr",
      },
    },
    {
      $unwind: {
        path: "$pr",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "warehouses",
        localField: "pr.deliverTo",
        foreignField: "id",
        as: "warehouse",
      },
    },
    {
      $addFields: {
        warehouseName: {
          $first: "$warehouse.name",
        },
      },
    },

    {
      $lookup: {
        from: "vendors",
        localField: "vendorId",
        foreignField: "id",
        as: "vendor",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "poApproverId",
        foreignField: "id",
        as: "poApproverUser",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "poVerifierId",
        foreignField: "id",
        as: "poVerifierUser",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "id",
        as: "createdByUser",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "id",
        as: "updatedByUser",
      },
    },
    {
      $addFields: {
        vendor: {
          $first: "$vendor",
        },
        poApprover: {
          $first: "$poApproverUser.name",
        },
        poApproverUser: {
          $first: "$poApproverUser",
        },
        poVerifier: {
          $first: "$poVerifierUser.name",
        },
        poVerifierUser: {
          $first: "$poVerifierUser",
        },
        createdByUser: {
          $first: "$createdByUser",
        },
        updatedByUser: {
          $first: "$updatedByUser",
        },
      },
    },
    ...require("../utils/items.pipeline"),
    {
      ...require("../message.pipeline"),
    },
    {
      $unset: ["_id", "__v", "vendor._id", "vendor.__v", "items._id"],
    },
  ];
}

// module.exports = list;
module.exports = {
  generalList,
  list,
};
