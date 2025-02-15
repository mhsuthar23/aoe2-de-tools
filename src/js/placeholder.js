// usage
// placeholder('<div>[[thing.to.replace]]')({thing: to:{replace: "this will be replaced"}})

export const placeholder = (template) => {
  return function (data) {
    /*!
     * Get an object value from a specific path
     * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
     * @param  {Object}       obj  The object
     * @param  {String|Array} path The path
     * @param  {*}            def  A default value to return [optional]
     * @return {*}                 The value
     */
    var get = function (obj, path, def) {
      /**
       * If the path is a string, convert it to an array
       * @param  {String|Array} path The path
       * @return {Array}             The path array
       */
      var stringToPath = function (path) {
        // If the path isn't a string, return it
        if (typeof path !== 'string') return path

        // Create new array
        var output = []

        // Split to an array with dot notation
        path.split('.').forEach(function (item) {
          // Split to an array with bracket notation
          item.split(/\[([^}]+)\]/g).forEach(function (key) {
            // Push to the new array
            if (key.length > 0) {
              output.push(key)
            }
          })
        })

        return output
      }

      // Get the path as an array
      path = stringToPath(path)

      // Cache the current object
      var current = obj

      // For each item in the path, dig into the object
      for (var i = 0; i < path.length; i++) {
        // If the item isn't found, return the default (or null)
        if (!current[path[i]]) return def

        // Otherwise, update the current  value
        current = current[path[i]]
      }

      return current
    }
    // Replace our curly braces with data
    template = template.replace(/\[\[([^\]]+)\]\]/g, function (match) {
      // Remove the wrapping curly braces
      match = match.slice(2, -2)

      // Get the value
      var val = get(data, match.trim())

      // Replace
      if (!val) return '[[' + match + ']]'
      return val
    })

    return template
  }
}
