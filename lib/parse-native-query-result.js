// Dependencies
const _ = require('@sailshq/lodash');
module.exports = {
  friendlyName: 'Parse native query result',
  description: 'Parse a raw result from a native query and normalize it for the specified query type.',
  sideEffects: 'cacheable',
  inputs: {
    queryType: {
      description: 'The type of query operation this raw result came from.',
      moreInfoUrl: 'https://github.com/node-machine/waterline-driver-interface#query-results',
      extendedDescription:
        'Either "select", "insert", "destroy", "update", "count", "sum", or "avg".  ' +
        'This determines how the provided raw result will be parsed/coerced.',
      required: true,
      example: '==='
      // example: 'select'
    },
    nativeQueryResult: {
      description: 'The result data sent back from the the database as a result of a native query.',
      extendedDescription: 'Specifically, be sure to use the `result` property of the output report from a successful native query (i.e. don\'t include `meta`!)  The data provided will be coerced to a JSON-serializable value if it isn\'t one already (see [rttc.dehydrate()](https://github.com/node-machine/rttc#dehydratevalue-allownullfalse-dontstringifyfunctionsfalse)). That means any Date instances therein will be converted to timezone-agnostic ISO timestamp strings (i.e. JSON timestamps).',
      required: true,
      example: '==='
    },
    meta: {
      friendlyName: 'Meta (custom)',
      description: 'Additional stuff to pass to the driver.',
      extendedDescription: 'This is reserved for custom driver-specific extensions.  Please refer to the documentation for the driver you are using for more specific information.',
      example: '==='
    }
  },
  exits: {
    success: {
      description: 'The result was successfully normalized.',
      outputVariableName: 'report',
      outputDescription: 'The `result` property is the normalized version of the raw result originally provided.   The `meta` property is reserved for custom driver-specific extensions.',
      outputExample: '==='
      // example: {
      //   result: '*',
      //   meta: '==='
      // }
    }
  },
  fn: async function parseNativeQueryResult(inputs, exits) {
    let normalizedResult;
    switch (inputs.queryType) {
      case 'select':
        normalizedResult = inputs.nativeQueryResult.rows;
        break;
      case 'insert':
        normalizedResult = {
          inserted: inputs.nativeQueryResult.rows[0].insertId
        };
        break;
      case 'update':
        normalizedResult = {
          numRecordsUpdated: inputs.nativeQueryResult.rows
        };
        break;
      case 'delete':
        normalizedResult = {
          numRecordsDeleted: inputs.nativeQueryResult.affectedRows
        };
        break;
      case 'avg':
        let avgResult = _.first(inputs.nativeQueryResult.rows);
        let avgResultKey = _.first(_.keys(avgResult));
        let avg = inputs.nativeQueryResult.rows[0][avgResultKey];
        normalizedResult = Number(avg);
        break;
      case 'sum':
        let sumResult = _.first(inputs.nativeQueryResult.rows);
        let sumResultKey = _.first(_.keys(sumResult));
        let sum = inputs.nativeQueryResult.rows[0][sumResultKey];
        normalizedResult = Number(sum);
        break;
      case 'count':
        let countResult = _.first(inputs.nativeQueryResult.rows);
        let countResultKey = _.first(_.keys(countResult));
        let count = inputs.nativeQueryResult.rows[0][countResultKey];
        normalizedResult = Number(count);
        break;
      default:
    }
    return exits.success({
      result: normalizedResult,
      meta: inputs.meta
    });
  }
};
