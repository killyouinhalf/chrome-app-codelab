(function(exports) {

  var nextId = 1;

  var TodoModel = function() {
    this.todos = {};
    this.listeners = [];
  }

  TodoModel.prototype.clearTodos = function() {
    this.todos = {};
    this.notifyListeners('removed');
  }

  TodoModel.prototype.archiveDone = function() {
    var oldTodos = this.todos;
    this.todos={};
    for (var id in oldTodos) {
      if ( ! oldTodos[id].isDone ) {
        this.todos[id] = oldTodos[id];
      }
    }
    this.notifyListeners('archived');
  }

  TodoModel.prototype.setTodoState = function(id, isDone) {
    if ( this.todos[id].isDone != isDone ) {
      this.todos[id].isDone = isDone;
      this.notifyListeners('stateChanged', id);
    }
  }

  TodoModel.prototype.addTodo = function(text, isDone) {
    var id = nextId++;
    this.todos[id]={'id': id, 'text': text, 'isDone': isDone};
    this.notifyListeners('added', id);
  }

  TodoModel.prototype.addListener = function(listener) {
    this.listeners.push(listener);
  }

  TodoModel.prototype.notifyListeners = function(change, param) {
    var this_ = this;
    this.listeners.forEach(function(listener) {
      listener(this_, change, param);
    });
  }

  exports.TodoModel = TodoModel;

})(window);


window.addEventListener('DOMContentLoaded', function() {

  var model = new TodoModel();
  var form = document.querySelector('form');
  var archive = document.getElementById('archive');
  var list = document.getElementById('list');
  var todoTemplate = document.querySelector('#templates > [data-name="list"]');

  form.addEventListener('submit', function(e) {
    var textEl = e.target.querySelector('input[type="text"]');
    model.addTodo(textEl.value, false);
    textEl.value=null;
    e.preventDefault();
  });

  archive.addEventListener('click', function(e) {
    model.archiveDone();
    e.preventDefault();
  });

  model.addListener(function(model, changeType, param) {
    if ( changeType === 'removed' || changeType === 'archived') {
      redrawUI(model);
    } else if ( changeType === 'added' ) {
      drawTodo(model.todos[param], list);
    } else if ( changeType === 'stateChanged') {
      updateTodo(model.todos[param]);
    }
    updateCounters(model);
  });

  var redrawUI = function(model) {
    list.innerHTML='';
    for (var id in model.todos) {
      drawTodo(model.todos[id], list);
    }
  };
  
  var drawTodo = function(todoObj, container) {
    var el = todoTemplate.cloneNode(true);
    el.setAttribute('data-id', todoObj.id);
    container.appendChild(el);
    updateTodo(todoObj);
    var checkbox = el.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function(e) {
      model.setTodoState(todoObj.id, e.target.checked);
    });
  }

  var updateTodo = function(model) {
    var todoElement = list.querySelector('li[data-id="'+model.id+'"]');
    if (todoElement) {
      var checkbox = todoElement.querySelector('input[type="checkbox"]');
      var desc = todoElement.querySelector('span');
      checkbox.checked = model.isDone;
      desc.innerText = model.text;
      desc.className = "done-"+model.isDone;
    }
  }

  var updateCounters = function(model) {
    var count = 0;
    var notDone = 0;
    for (var id in model.todos) {
      count++;
      if ( ! model.todos[id].isDone ) {
        notDone ++;
      }
    }
    document.getElementById('remaining').innerText = notDone;
    document.getElementById('length').innerText = count;
  }

  updateCounters(model);

});
    