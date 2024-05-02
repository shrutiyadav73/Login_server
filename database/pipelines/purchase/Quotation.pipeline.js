function list(query = {}) {
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
        from: "purchase_requests",
        let: {
          rfq_prRequestId: "$prRequestId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$id", "$$rfq_prRequestId"],
              },
            },
          },
          {
            $lookup: {
              from: "manufactures",
              localField: "manufacturer",
              foreignField: "id",
              as: "manufacturer",
            },
          },
          {
            $addFields: {
              manufacturer: {
                $first: "$manufacturer",
              },
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "id",
              as: "categories",
            },
          },
          {
            $addFields: {
              category: {
                $first: "$categories.name",
              },
            },
          },
          {
            $lookup: {
              from: "subcategories",
              localField: "subcategoryId",
              foreignField: "id",
              as: "subcategories",
            },
          },
          {
            $addFields: {
              subcategory: {
                $first: "$subcategories.name",
              },
            },
          },
          {
            $unset: [
              "__v",
              "_id",
              "pr.__v",
              "pr._id",
              "createdByUser",
              "updatedByUser",
              "client",
              "project",
              "prApproverUser",
              "poApproverObj",
            ],
          },
        ],
        as: "pr",
      },
    },
    {
      $addFields: {
        pr: {
          $first: "$pr",
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
      $addFields: {
        vendorDisplayName: {
          $first: "$vendor.vendorDisplayName",
        },
        vendor: {
          $first: "$vendor",
        },
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
      $addFields: {
        createdByName: {
          $first: "$createdByUser.name",
        },
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
        updatedByName: {
          $first: "$updatedByUser.name",
        },
      },
    },
    {
      $unset: ["__v", "_id", "createdByUser", "updatedByUser"],
    },
  ];
}

function basicTablePipeline() {
  return [
    {
      $match: {
        status: {
          $ne: "deleted",
        },
      },
    },
    {
      $lookup: {
        from: "purchase_rfqs",
        localField: "rfqId",
        foreignField: "id",
        as: "rfqList",
      },
    },
    {
      $addFields: {
        rfq: {
          $first: "$rfqList",
        },
      },
    },
    {
      $lookup: {
        from: "vendors",
        localField: "rfq.vendorId",
        foreignField: "id",
        as: "vendor",
      },
    },
    {
      $addFields: {
        vendor: {
          $first: "$vendor",
        },
      },
    },
    {
      $lookup: {
        from: "purchase_requests",
        localField: "rfq.prRequestId",
        foreignField: "id",
        as: "pr",
      },
    },
    {
      $addFields: {
        pr: {
          $first: "$pr",
        },
      },
    },

    {
      $lookup: {
        from: "clients",
        localField: "pr.clientId",
        foreignField: "id",
        as: "client",
      },
    },
    {
      $addFields: {
        clientName: { $first: "$client.name" },
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "pr.projectId",
        foreignField: "id",
        as: "project",
      },
    },
    {
      $addFields: {
        projectName: { $first: "$project.name" },
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
        warehouseName: { $first: "$warehouse.name" },
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
      $addFields: {
        createdByName: {
          $first: "$createdByUser.name",
        },
      },
    },

    ...require("../utils/items.pipeline"),
    {
      $unset: ["_id", "__v", "rfqList", "createdByUser"],
    },
  ];
}

function byIpnPipeline(ipn) {
  return [
    {
      $match: {
        "items.ipn": ipn,
      },
    },
    {
      $lookup: {
        from: "purchase_rfqs",
        localField: "rfqId",
        foreignField: "id",
        as: "rfqList",
      },
    },
    {
      $addFields: {
        rfq: {
          $first: "$rfqList",
        },
      },
    },
    {
      $lookup: {
        from: "vendors",
        localField: "rfq.vendorId",
        foreignField: "id",
        as: "vendor",
      },
    },
    {
      $addFields: {
        vendor: {
          $first: "$vendor",
        },
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
      $addFields: {
        createdByName: {
          $first: "$createdByUser.name",
        },
      },
    },
    {
      $unset: ["_id", "__v", "rfqList", "createdByUser"],
    },
  ];
}

module.exports = list;
module.exports = {
  basicTablePipeline,
  byIpnPipeline,
};
