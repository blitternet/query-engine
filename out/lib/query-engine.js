// Generated by CoffeeScript 1.3.1
(function() {
  var Backbone, Hash, Pill, Query, QueryCollection, queryEngine, util, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = typeof module !== "undefined" && module !== null ? require('underscore') : this._;

  Backbone = typeof module !== "undefined" && module !== null ? require('backbone') : this.Backbone;

  util = {
    safeRegex: function(str) {
      return (str || '').replace('(.)', '\\$1');
    },
    createRegex: function(str) {
      return new RegExp(str, 'ig');
    },
    createSafeRegex: function(str) {
      return util.createRegex(util.safeRegex(str));
    },
    toArray: function(value) {
      var item, key, result;
      result = [];
      if (value) {
        if (_.isArray(value)) {
          result = value;
        } else if (_.isObject(value)) {
          for (key in value) {
            if (!__hasProp.call(value, key)) continue;
            item = value[key];
            result.push(item);
          }
        } else {
          result.push(value);
        }
      }
      return result;
    },
    toArrayGroup: function(value) {
      var item, key, obj, result;
      result = [];
      if (value) {
        if (_.isArray(value)) {
          result = value;
        } else if (_.isObject(value)) {
          for (key in value) {
            if (!__hasProp.call(value, key)) continue;
            item = value[key];
            obj = {};
            obj[key] = item;
            result.push(obj);
          }
        } else {
          result.push(value);
        }
      }
      return result;
    },
    generateComparator: function(input) {
      var generateFunction;
      generateFunction = function(comparator) {
        if (!comparator) {
          throw new Error('Cannot sort without a comparator');
        } else if (_.isFunction(comparator)) {
          return comparator;
        } else if (_.isArray(comparator)) {
          return function(a, b) {
            var comparison, key, value, _i, _len;
            comparison = 0;
            for (key = _i = 0, _len = comparator.length; _i < _len; key = ++_i) {
              value = comparator[key];
              comparison = generateFunction(value)(a, b);
              if (comparison) {
                return comparison;
              }
            }
            return comparison;
          };
        } else if (_.isObject(comparator)) {
          return function(a, b) {
            var aValue, bValue, comparison, key, value, _ref, _ref1;
            comparison = 0;
            for (key in comparator) {
              if (!__hasProp.call(comparator, key)) continue;
              value = comparator[key];
              aValue = (_ref = typeof a.get === "function" ? a.get(key) : void 0) != null ? _ref : a[key];
              bValue = (_ref1 = typeof b.get === "function" ? b.get(key) : void 0) != null ? _ref1 : b[key];
              if (aValue === bValue) {
                comparison = 0;
              } else if (aValue < bValue) {
                comparison = -1;
              } else if (aValue > bValue) {
                comparison = 1;
              }
              if (value === -1) {
                comparison *= -1;
              }
              if (comparison) {
                return comparison;
              }
            }
            return comparison;
          };
        } else {
          throw new Error('Unknown comparator type');
        }
      };
      return generateFunction(input);
    }
  };

  Hash = (function(_super) {

    __extends(Hash, _super);

    Hash.name = 'Hash';

    Hash.prototype.arr = [];

    function Hash(value) {
      var item, key, _i, _len;
      value = util.toArray(value);
      for (key = _i = 0, _len = value.length; _i < _len; key = ++_i) {
        item = value[key];
        this.push(item);
      }
    }

    Hash.prototype.hasIn = function(options) {
      var value, _i, _len;
      options = util.toArray(options);
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        value = this[_i];
        if (__indexOf.call(options, value) >= 0) {
          return true;
        }
      }
      return false;
    };

    Hash.prototype.hasAll = function(options) {
      var empty, pass, value, _i, _len;
      options = util.toArray(options);
      empty = true;
      pass = true;
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        value = this[_i];
        empty = false;
        if (__indexOf.call(options, value) < 0) {
          pass = false;
        }
      }
      if (empty) {
        pass = false;
      }
      return pass;
    };

    Hash.prototype.isSame = function(options) {
      var pass;
      options = util.toArray(options);
      pass = this.sort().join() === options.sort().join();
      return pass;
    };

    return Hash;

  })(Array);

  QueryCollection = (function(_super) {

    __extends(QueryCollection, _super);

    QueryCollection.name = 'QueryCollection';

    function QueryCollection() {
      return QueryCollection.__super__.constructor.apply(this, arguments);
    }

    QueryCollection.prototype.model = Backbone.Model;

    QueryCollection.prototype.initialize = function(models, options) {
      var _base;
      _.bindAll(this, 'onChange', 'onParentChange', 'onParentRemove', 'onParentAdd', 'onParentReset');
      this.options = _.extend({}, this.options || {}, options || {});
      this.options.filters = _.extend({}, this.options.filters || {});
      this.options.queries = _.extend({}, this.options.queries || {});
      this.options.pills = _.extend({}, this.options.pills || {});
      (_base = this.options).searchString || (_base.searchString = null);
      this.setFilters(this.options.filters);
      this.setQueries(this.options.queries);
      this.setPills(this.options.pills);
      this.setSearchString(this.options.searchString);
      this.live();
      return this;
    };

    QueryCollection.prototype.getFilter = function(key) {
      return this.options.filters[key];
    };

    QueryCollection.prototype.getFilters = function() {
      return this.options.filters;
    };

    QueryCollection.prototype.setFilters = function(filters) {
      var key, value;
      filters || (filters = {});
      for (key in filters) {
        if (!__hasProp.call(filters, key)) continue;
        value = filters[key];
        this.setFilter(key, value);
      }
      return this;
    };

    QueryCollection.prototype.setFilter = function(name, value) {
      var filters;
      if (typeof value === 'undefined') {
        throw new Error('QueryCollection::setFilter was called without both arguments');
      }
      filters = this.options.filters;
      if (value != null) {
        filters[name] = value;
      } else if (filters[name] != null) {
        delete filters[name];
      }
      return this;
    };

    QueryCollection.prototype.getQuery = function(key) {
      return this.options.queries[key];
    };

    QueryCollection.prototype.getQueries = function() {
      return this.options.queries;
    };

    QueryCollection.prototype.setQueries = function(queries) {
      var key, value;
      queries || (queries = {});
      for (key in queries) {
        if (!__hasProp.call(queries, key)) continue;
        value = queries[key];
        this.setQuery(key, value);
      }
      return this;
    };

    QueryCollection.prototype.setQuery = function(name, value) {
      var queries;
      if (typeof value === 'undefined') {
        throw new Error('QueryCollection::setQuery was called without both arguments');
      }
      queries = this.options.queries;
      if (value != null) {
        if (!(value instanceof Query)) {
          value = new Query(value);
        }
        queries[name] = value;
      } else if (queries[name] != null) {
        delete queries[name];
      }
      return this;
    };

    QueryCollection.prototype.getPill = function(key) {
      return this.options.pills[key];
    };

    QueryCollection.prototype.getPills = function() {
      return this.options.pills;
    };

    QueryCollection.prototype.setPills = function(pills) {
      var key, value;
      pills || (pills = {});
      for (key in pills) {
        if (!__hasProp.call(pills, key)) continue;
        value = pills[key];
        this.setPill(key, value);
      }
      return this;
    };

    QueryCollection.prototype.setPill = function(name, value) {
      var pills, searchString;
      if (typeof value === 'undefined') {
        throw new Error('QueryCollection::setPill was called without both arguments');
      }
      pills = this.options.pills;
      searchString = this.options.searchString;
      if (value != null) {
        if (!(value instanceof Pill)) {
          value = new Pill(value);
        }
        if (searchString) {
          value.setSearchString(searchString);
        }
        pills[name] = value;
      } else if (pills[name] != null) {
        delete pills[name];
      }
      return this;
    };

    QueryCollection.prototype.getCleanedSearchString = function() {
      return this.options.cleanedSearchString;
    };

    QueryCollection.prototype.getSearchString = function() {
      return this.options.searchString;
    };

    QueryCollection.prototype.setSearchString = function(searchString) {
      var cleanedSearchString, pills;
      pills = this.options.pills;
      cleanedSearchString = searchString;
      _.each(pills, function(pill, pillName) {
        cleanedSearchString = pill.setSearchString(cleanedSearchString);
        return true;
      });
      this.options.searchString = searchString;
      this.options.cleanedSearchString = cleanedSearchString;
      return this;
    };

    QueryCollection.prototype.hasParentCollection = function() {
      return this.options.parentCollection != null;
    };

    QueryCollection.prototype.getParentCollection = function() {
      return this.options.parentCollection;
    };

    QueryCollection.prototype.setParentCollection = function(parentCollection, skipCheck) {
      if (!skipCheck && this.options.parentCollection === parentCollection) {
        return this;
      }
      this.options.parentCollection = parentCollection;
      this.live();
      return this;
    };

    QueryCollection.prototype.hasModel = function(model) {
      var exists;
      model || (model = {});
      if ((model.id != null) && this.get(model.id)) {
        exists = true;
      } else if ((model.cid != null) && this.getByCid(model.cid)) {
        exists = true;
      } else {
        exists = false;
      }
      return exists;
    };

    QueryCollection.prototype.safeRemove = function(model) {
      var exists;
      exists = this.hasModel(model);
      if (exists) {
        this.remove(model);
      }
      return this;
    };

    QueryCollection.prototype.safeAdd = function(model) {
      var exists;
      exists = this.hasModel(model);
      if (!exists) {
        this.add(model);
      }
      return this;
    };

    QueryCollection.prototype.setComparator = function(comparator) {
      comparator = util.generateComparator(comparator);
      this.comparator = comparator;
      return this;
    };

    QueryCollection.prototype.sortCollection = function(comparator) {
      if (comparator) {
        comparator = util.generateComparator(comparator);
        this.models.sort(comparator);
      } else if (this.comparator) {
        this.models.sort(this.comparator);
      } else {
        throw new Error('You need a comparator to sort');
      }
      return this;
    };

    QueryCollection.prototype.sortArray = function(comparator) {
      var arr;
      arr = this.toJSON();
      if (comparator) {
        comparator = util.generateComparator(comparator);
        arr.sort(comparator);
      } else if (this.comparator) {
        arr.sort(this.comparator);
      } else {
        throw new Error('You need a comparator to sort');
      }
      return arr;
    };

    QueryCollection.prototype.query = function() {
      var collection, me, models;
      me = this;
      models = [];
      collection = this.getParentCollection() || this;
      collection.each(function(model) {
        var pass;
        pass = me.test(model);
        if (pass) {
          return models.push(model);
        }
      });
      this.reset(models);
      return this;
    };

    QueryCollection.prototype.createChildCollection = function(models, options) {
      var collection;
      options || (options = {});
      options.parentCollection = this;
      collection = new (options.collection || this.collection || QueryCollection)(models, options);
      if (this.comparator) {
        if (collection.comparator == null) {
          collection.comparator = this.comparator;
        }
      }
      return collection;
    };

    QueryCollection.prototype.createLiveChildCollection = function(models, options) {
      var collection;
      options || (options = {});
      options.live = true;
      collection = this.createChildCollection(models, options);
      return collection;
    };

    QueryCollection.prototype.findAll = function(query) {
      var collection;
      collection = this.createChildCollection().setQuery('find', query).query();
      return collection;
    };

    QueryCollection.prototype.findOne = function(query) {
      var collection;
      collection = this.createChildCollection().setQuery('find', query).query();
      if (collection && collection.length) {
        return collection.models[0];
      } else {
        return null;
      }
    };

    QueryCollection.prototype.live = function(enabled) {
      var parentCollection;
      if (enabled == null) {
        enabled = this.options.live;
      }
      this.options.live = enabled;
      if (enabled) {
        this.on('change', this.onChange);
      } else {
        this.off('change', this.onChange);
      }
      parentCollection = this.getParentCollection();
      if (parentCollection != null) {
        if (enabled) {
          parentCollection.on('change', this.onParentChange);
          parentCollection.on('remove', this.onParentRemove);
          parentCollection.on('add', this.onParentAdd);
          parentCollection.on('reset', this.onParentReset);
        } else {
          parentCollection.off('change', this.onParentChange);
          parentCollection.off('remove', this.onParentRemove);
          parentCollection.off('add', this.onParentAdd);
          parentCollection.off('reset', this.onParentReset);
        }
      }
      return this;
    };

    QueryCollection.prototype.add = function(models, options) {
      var model, passedModels, _i, _len;
      options = options ? _.clone(options) : {};
      models = _.isArray(models) ? models.slice() : [models];
      passedModels = [];
      for (_i = 0, _len = models.length; _i < _len; _i++) {
        model = models[_i];
        model = this._prepareModel(model, options);
        if (model && this.test(model)) {
          passedModels.push(model);
        }
      }
      Backbone.Collection.prototype.add.apply(this, [passedModels, options]);
      return this;
    };

    QueryCollection.prototype.create = function(model, options) {
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (model && this.test(model)) {
        Backbone.Collection.prototype.create.apply(this, [model, options]);
      }
      return this;
    };

    QueryCollection.prototype.onChange = function(model) {
      var pass;
      pass = this.test(model);
      if (!pass) {
        this.safeRemove(model);
      } else {
        if (this.comparator) {
          this.sortCollection();
        }
      }
      return this;
    };

    QueryCollection.prototype.onParentChange = function(model) {
      var pass;
      pass = this.test(model) && this.getParentCollection().test(model);
      if (pass) {
        this.safeAdd(model);
      } else {
        this.safeRemove(model);
      }
      return this;
    };

    QueryCollection.prototype.onParentRemove = function(model) {
      this.safeRemove(model);
      return this;
    };

    QueryCollection.prototype.onParentAdd = function(model) {
      this.safeAdd(model);
      return this;
    };

    QueryCollection.prototype.onParentReset = function(model) {
      this.reset(this.getParentCollection().models);
      return this;
    };

    QueryCollection.prototype.test = function(model) {
      var pass;
      pass = this.testFilters(model) && this.testQueries(model) && this.testPills(model);
      return pass;
    };

    QueryCollection.prototype.testFilters = function(model) {
      var cleanedSearchString, filters, pass;
      pass = true;
      cleanedSearchString = this.getCleanedSearchString();
      filters = this.getFilters();
      _.each(filters, function(filter, filterName) {
        if (filter(model, cleanedSearchString) === false) {
          pass = false;
          return false;
        }
      });
      return pass;
    };

    QueryCollection.prototype.testQueries = function(model) {
      var pass, queries;
      pass = true;
      queries = this.getQueries();
      _.each(queries, function(query, queryName) {
        if (query.test(model) === false) {
          pass = false;
          return false;
        }
      });
      return pass;
    };

    QueryCollection.prototype.testPills = function(model) {
      var pass, pills, searchString;
      pass = true;
      searchString = this.getSearchString();
      pills = this.getPills();
      if (searchString != null) {
        _.each(pills, function(pill, pillName) {
          if (pill.test(model) === false) {
            pass = false;
            return false;
          }
        });
      }
      return pass;
    };

    return QueryCollection;

  })(Backbone.Collection);

  Pill = (function() {

    Pill.name = 'Pill';

    Pill.prototype.callback = null;

    Pill.prototype.regex = null;

    Pill.prototype.prefixes = null;

    Pill.prototype.searchString = null;

    Pill.prototype.values = null;

    Pill.prototype.logicalOperator = 'OR';

    function Pill(pill) {
      var prefix, regexString, safePrefixes, safePrefixesStr, _i, _len, _ref;
      pill || (pill = {});
      this.callback = pill.callback;
      this.prefixes = pill.prefixes;
      if (pill.logicalOperator != null) {
        this.logicalOperator = pill.logicalOperator;
      }
      safePrefixes = [];
      _ref = this.prefixes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prefix = _ref[_i];
        safePrefixes.push(util.safeRegex(prefix));
      }
      safePrefixesStr = safePrefixes.join('|');
      regexString = "(" + safePrefixesStr + ")\\s*('[^']+'|\\\"[^\\\"]+\\\"|[^'\\\"\\s]\\S*)";
      this.regex = util.createRegex(regexString);
      this;

    }

    Pill.prototype.setSearchString = function(searchString) {
      var cleanedSearchString, match, values;
      cleanedSearchString = searchString;
      values = [];
      while (match = this.regex.exec(searchString)) {
        values.push(match[2].trim().replace(/(^['"]\s*|\s*['"]$)/g, ''));
        cleanedSearchString = searchString.replace(match[0], '').trim();
      }
      this.searchString = searchString;
      this.values = values;
      return cleanedSearchString;
    };

    Pill.prototype.test = function(model) {
      var pass, value, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      if ((_ref = this.values) != null ? _ref.length : void 0) {
        if (this.logicalOperator === 'OR') {
          pass = false;
          _ref1 = this.values;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            value = _ref1[_i];
            pass = this.callback(model, value);
            if (pass) {
              break;
            }
          }
        } else if (this.logicalOperator === 'AND') {
          pass = false;
          _ref2 = this.values;
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            value = _ref2[_j];
            pass = this.callback(model, value);
            if (!pass) {
              break;
            }
          }
        } else {
          throw new Error('Unkown logical operator type');
        }
      } else {
        pass = null;
      }
      return pass;
    };

    return Pill;

  })();

  Query = (function() {

    Query.name = 'Query';

    Query.prototype.query = null;

    function Query(query) {
      if (query == null) {
        query = {};
      }
      this.query = query;
    }

    Query.prototype.test = function(model) {
      var $beginsWith, $beginsWithValue, $endWithValue, $endsWith, $size, empty, match, matchAll, matchAny, modelId, modelValue, modelValueExists, query, queryGroup, selectorName, selectorValue, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref;
      matchAll = true;
      matchAny = false;
      empty = true;
      _ref = this.query;
      for (selectorName in _ref) {
        if (!__hasProp.call(_ref, selectorName)) continue;
        selectorValue = _ref[selectorName];
        match = false;
        empty = false;
        modelValue = model.get(selectorName);
        modelId = model.get('id');
        modelValueExists = typeof modelValue !== 'undefined';
        if (!modelValueExists) {
          modelValue = false;
        }
        if (selectorName === '$nor') {
          match = true;
          queryGroup = util.toArrayGroup(selectorValue);
          if (!queryGroup.length) {
            throw new Error('Query called with an empty $nor statement');
          }
          for (_i = 0, _len = queryGroup.length; _i < _len; _i++) {
            query = queryGroup[_i];
            query = new Query(query);
            if (query.test(model)) {
              match = false;
              break;
            }
          }
        }
        if (selectorName === '$or') {
          queryGroup = util.toArrayGroup(selectorValue);
          if (!queryGroup.length) {
            throw new Error('Query called with an empty $or statement');
          }
          for (_j = 0, _len1 = queryGroup.length; _j < _len1; _j++) {
            query = queryGroup[_j];
            query = new Query(query);
            if (query.test(model)) {
              match = true;
              break;
            }
          }
        }
        if (selectorName === '$and') {
          match = false;
          queryGroup = util.toArrayGroup(selectorValue);
          if (!queryGroup.length) {
            throw new Error('Query called with an empty $and statement');
          }
          for (_k = 0, _len2 = queryGroup.length; _k < _len2; _k++) {
            query = queryGroup[_k];
            query = new Query(query);
            match = query.test(model);
            if (!match) {
              break;
            }
          }
        }
        if (_.isString(selectorValue) || _.isNumber(selectorValue) || _.isBoolean(selectorValue)) {
          if (modelValueExists && modelValue === selectorValue) {
            match = true;
          }
        } else if (_.isArray(selectorValue)) {
          if (modelValueExists && (new Hash(modelValue)).isSame(selectorValue)) {
            match = true;
          }
        } else if (_.isDate(selectorValue)) {
          if (modelValueExists && modelValue.toString() === selectorValue.toString()) {
            match = true;
          }
        } else if (_.isRegExp(selectorValue)) {
          if (modelValueExists && selectorValue.test(modelValue)) {
            match = true;
          }
        } else if (_.isObject(selectorValue)) {
          $beginsWith = selectorValue.$beginsWith || selectorValue.$startsWith || null;
          if ($beginsWith && modelValueExists && _.isString(modelValue)) {
            if (!_.isArray($beginsWith)) {
              $beginsWith = [$beginsWith];
            }
            for (_l = 0, _len3 = $beginsWith.length; _l < _len3; _l++) {
              $beginsWithValue = $beginsWith[_l];
              if (modelValue.substr(0, $beginsWithValue.length) === $beginsWithValue) {
                match = true;
                break;
              }
            }
          }
          $endsWith = selectorValue.$endsWith || selectorValue.$finishesWith || null;
          if ($endsWith && modelValueExists && _.isString(modelValue)) {
            if (!_.isArray($endsWith)) {
              $endsWith = [$endsWith];
            }
            for (_m = 0, _len4 = $endsWith.length; _m < _len4; _m++) {
              $endWithValue = $endsWith[_m];
              if (modelValue.substr($endWithValue.length * -1) === $endWithValue) {
                match = true;
                break;
              }
            }
          }
          if (selectorValue.$all) {
            if (modelValueExists) {
              if ((new Hash(modelValue)).hasAll(selectorValue.$all)) {
                match = true;
              }
            }
          }
          if (selectorValue.$in) {
            if (modelValueExists) {
              if ((new Hash(modelValue)).hasIn(selectorValue.$in)) {
                match = true;
              } else if ((new Hash(selectorValue.$in)).hasIn(modelValue)) {
                match = true;
              }
            }
          }
          if (selectorValue.$has) {
            if (modelValueExists) {
              if ((new Hash(modelValue)).hasIn(selectorValue.$has)) {
                match = true;
              }
            }
          }
          if (selectorValue.$hasAll) {
            if (modelValueExists) {
              if ((new Hash(modelValue)).hasIn(selectorValue.$hasAll)) {
                match = true;
              }
            }
          }
          if (selectorValue.$nin) {
            if (modelValueExists) {
              if ((new Hash(modelValue)).hasIn(selectorValue.$nin) === false && (new Hash(selectorValue.$nin)).hasIn(selectorValue) === false) {
                match = true;
              }
            }
          }
          $size = selectorValue.$size || selectorValue.$length;
          if ($size) {
            if ((modelValue.length != null) && modelValue.length === $size) {
              match = true;
            }
          }
          if (selectorValue.$type) {
            if (typeof modelValue === selectorValue.$type) {
              match = true;
            }
          }
          if (selectorValue.$exists) {
            if (selectorValue.$exists) {
              if (modelValueExists === true) {
                match = true;
              }
            } else {
              if (modelValueExists === false) {
                match = true;
              }
            }
          }
          if (selectorValue.$mod) {
            match = false;
          }
          if (selectorValue.$ne) {
            if (modelValueExists && modelValue !== selectorValue.$ne) {
              match = true;
            }
          }
          if (selectorValue.$lt) {
            if (modelValueExists && modelValue < selectorValue.$lt) {
              match = true;
            }
          }
          if (selectorValue.$gt) {
            if (modelValueExists && modelValue > selectorValue.$gt) {
              match = true;
            }
          }
          if (selectorValue.$lte) {
            if (modelValueExists && modelValue <= selectorValue.$lte) {
              match = true;
            }
          }
          if (selectorValue.$gte) {
            if (modelValueExists && modelValue >= selectorValue.$gte) {
              match = true;
            }
          }
        }
        if (match) {
          matchAny = true;
        } else {
          matchAll = false;
        }
      }
      if (matchAll && !matchAny) {
        matchAll = false;
      }
      return matchAll;
    };

    return Query;

  })();

  queryEngine = {
    safeRegex: util.safeRegex,
    createRegex: util.createRegex,
    createSafeRegex: util.createSafeRegex,
    generateComparator: util.generateComparator,
    toArray: util.toArray,
    Backbone: Backbone,
    Hash: Hash,
    QueryCollection: QueryCollection,
    Query: Query,
    Pill: Pill,
    createCollection: function(models, options) {
      var collection;
      models = util.toArray(models);
      collection = new QueryCollection(models, options);
      return collection;
    },
    createLiveCollection: function(models, options) {
      var collection;
      models = util.toArray(models);
      collection = new QueryCollection(models, options).live(true);
      return collection;
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = queryEngine;
  } else {
    this.queryEngine = queryEngine;
  }

}).call(this);
