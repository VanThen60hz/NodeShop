"use strict";

const { Types } = require("mongoose");

const _ = require("lodash");

const convertToObjectIdMongodb = (id) => new Types.ObjectId(id);

const getInfoData = ({ fields = [], object = {} }) => {};

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 1]));
};

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 0]));
};

const parseAndFlattenObject = (obj) => {
    const final = {};

    const recurse = (current, prefix = "") => {
        Object.keys(current).forEach((key) => {
            const value = current[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === "object" && !Array.isArray(value)) {
                // Recursively process nested objects
                recurse(value, newKey);
            } else if (value != null) {
                // Add key-value pair if value is not null or undefined
                final[newKey] = value;
            }
        });
    };

    recurse(obj);
    return final;
};

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    parseAndFlattenObject,
    convertToObjectIdMongodb,
};
