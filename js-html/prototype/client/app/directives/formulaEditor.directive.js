angular.module('cube')
  .directive('formulaEditor', ['$rootScope', 'data', function($rootScope, data) {
    return {
      restrict: 'E',
      templateUrl: 'app/directives/formula-editor.html',

      controller: function($scope) {
        this.popup = {};
        this.popup.header = 'My Header';
        this.popup.content = 'My Body';

        test = this.popup;
        this.updatePopup = function(name){
          $('#formula-popover').popover('show');
          $scope.$apply(editorController.popup.header = name);
          $scope.$apply(editorController.popup.content = name);
        };

        var editorController = this;

        // Watch the dimension array
        $scope.dimensions = data.dataset.getDimensionNames();
        // Attach typeahead logic to the UI
        $scope.$watchCollection('dimensions', function(dimensions) {
          // Only attach the typeahead logic if there are dimensions available
          if (dimensions.length > 0) {
            // Attach X and Y variables to the dimension list
            // We copy the dimensions list to not interfere with it in other controllers
            var typeaheadDimensions = dimensions.slice(0);
            typeaheadDimensions.splice(0, 0, 'x', 'y');
            $('#formulaInput').textcomplete([{
              words: typeaheadDimensions,
              match: /\b(\w{0,})$/,
              search: function(term, callback) {
                callback($.map(this.words, function(word) {
                  var currentWord = word.indexOf(term) === 0 ? word : null;
                  if (currentWord !== null)
                    editorController.updatePopup(currentWord);
                  return word.indexOf(term) === 0 ? word : null;
                }));
              },
              index: 1,
              replace: function(word) {
                return word + ' ';
              }
            }]);
          }
        });
      },
      controllerAs: 'editor'
    };
  }]);
