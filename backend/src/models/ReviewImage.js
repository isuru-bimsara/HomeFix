


// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const ReviewImage = sequelize.define(
//   "ReviewImage",
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },

//     reviewId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       unique: true,
//       field: "review_id",
//     },

//     imageUrl: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//       field: "image_url",
//     },

//     publicId: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       field: "public_id",
//     },

//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       field: "created_at",
//     },

//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       field: "updated_at",
//     },
//   },
//   {
//     tableName: "review_images",
//     timestamps: false,
//   }
// );

// module.exports = ReviewImage;



const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReviewImage = sequelize.define(
  "ReviewImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    reviewId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "review_id",
    },

    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "image_url",
    },

    publicId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "public_id",
    },
  },
  {
    tableName: "review_images",
    timestamps: true,
    // Keep the JavaScript attributes as createdAt/updatedAt while mapping
    // them to the snake_case columns that already exist in PostgreSQL.
    underscored: true,
  }
);

module.exports = ReviewImage;
