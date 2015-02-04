(function() {
RCUBE.RegressionFormula = function(formula, validVariables) {
  if (typeof(formula) == 'undefined')
    this._formula = '';
  else
    this._formula = formula;

  this._valid = false;
  this._reconstructedFormula = '';

  if (typeof(validVariables) == 'undefined')
    this._validVariables = [];
  else
    this._validVariables = validVariables;
  this.update(formula);
};

RCUBE.RegressionFormula.prototype.setValidVariables = function(validVariables) {
  this._validVariables = validVariables;
  this.update();
};

RCUBE.RegressionFormula.prototype.setFormula = function(formula) {
  // this._formula = formula.slice(0);
  this._formula = formula;
  this.update();
};

RCUBE.RegressionFormula.prototype.update = function() {
  var self = this;
  this._valid = false;
  this._reconstructedFormula = '';
  // Regex formulas for variables and operators
  this._regexVariables = /([^\^\+\-\:\*\/\|\s]+)/g;
  this._regexOperators = /([\^\+\-\:\*\/\|])/g;
  // Apply regex to the input formula
  this._variables = this._formula.match(this._regexVariables);
  this._operators = this._formula.match(this._regexOperators);

  // Check the formula for validity
  if (this._variables !== null && this._operators !== null && this._operators.length == this._variables.length - 1) {
    this._valid = true;
    this._variables.forEach(function(variable, index) {
      // check if the current variable is valid
      if (self._validVariables.indexOf(variable) == -1) {
        self._valid = false;
        return;
      }
      self._reconstructedFormula = self._reconstructedFormula + variable;
      // If it is not the last element, attach the operator
      if (index != self._variables.length - 1)
        self._reconstructedFormula = self._reconstructedFormula + self._operators[index];
    });
  }
};

RCUBE.RegressionFormula.prototype.isValid = function(){
  return this._valid;
};

RCUBE.RegressionFormula.prototype.toString = function(){
  return this._reconstructedFormula;
};
})();