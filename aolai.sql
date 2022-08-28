/*
 Navicat Premium Data Transfer

 Source Server         : database
 Source Server Type    : MySQL
 Source Server Version : 80029
 Source Host           : localhost:3306
 Source Schema         : aolai

 Target Server Type    : MySQL
 Target Server Version : 80029
 File Encoding         : 65001

 Date: 11/08/2022 10:12:13
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for goods_search
-- ----------------------------
DROP TABLE IF EXISTS `goods_search`;
CREATE TABLE `goods_search`  (
  `id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `imgUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `pprice` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `oprice` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `discount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of goods_search
-- ----------------------------
INSERT INTO `goods_search` VALUES ('1', '../../static/img/commodity1.jpg', '大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008', '39', '489', '8');
INSERT INTO `goods_search` VALUES ('2', '../../static/img/commodity1.jpg', '大姨绒毛大款2020年必须买,不买你就不行了,', '49', '489', '7');
INSERT INTO `goods_search` VALUES ('3', '../../static/img/commodity1.jpg', '大姨', '59', '489', '6');
INSERT INTO `goods_search` VALUES ('4', '../../static/img/commodity1.jpg', '小款服装', '69', '489', '5');
INSERT INTO `goods_search` VALUES ('5', '../../static/img/commodity1.jpg', '宽松大衣', '89', '489', '4');

SET FOREIGN_KEY_CHECKS = 1;
