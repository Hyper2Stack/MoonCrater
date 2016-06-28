(function($win, $doc) {

var _markName = 'uitag';

var ajax = {
  _nop: function () {},
  resource: function (name, path, async) {
    if (async !== true) async = false;
    return $.ajax({
      url: path,
      method: 'GET',
      async: async
    });
  }
};

var component = {
  designView: false,
  cache: {},
  load: function (name, path, async) {
    if (component.cache[name]) return null;
    return ajax.resource(name, path, async).done(function (html) {
      component.cache[name] = html;
    });
  },
  _appendDom: function (dom, elements, templates) {
    var id = $(dom).attr(_markName);
    if (!id) {
      component._searchDom(dom, elements, templates);
      return;
    }
    switch (id.charCodeAt(0)) {
    case 64: // '@', nest
      var subelements = {}, subtemplates = {};
      id = id.substring(1);
      elements[id] = {
        self: dom,
        dom: subelements,
        template: subtemplates
      }
      component._searchDom(dom, subelements, subtemplates);
      break;
    case 93: // ']', array element
      id = id.substring(1);
      if (!$.isArray(elements[id])) elements[id] = [];
      elements[id].push(dom);
      component._searchDom(dom, elements, templates);
      break;
    case 43: // '+', template
      id = id.substring(1);
      if (!component.designView) {
        $(dom).removeAttr(_markName);
        if (templates[id]) {
          templates[id] += $(dom).prop('outerHTML');
        } else {
          templates[id] = $(dom).prop('outerHTML');
        }
        $(dom).remove();
        break;
      }
      // if in design view, we can see the template as a dom
      // in browser; thus here should not have a break
    default:
      if (elements[id]) {
        if (!elements[id].length) {
          elements[id] = [elements[id], dom];
        } else {
          elements[id].push(dom);
        }
      } else {
        elements[id] = dom;
      }
      component._searchDom(dom, elements, templates);
    }
  },
  _searchDom: function (dom, elements, templates) {
    var ch = $(dom).children();
    var n = ch.length;
    if (n <= 0) return;
    var i;
    for (i=0; i<n; i++) {
      component._appendDom(ch[i], elements, templates);
    }
  },
  createT: function (template, control) {
    if (!template) return null;
    if (!control) control = {};
    var dom = $(template);
    return component.scan(dom, control);
  },
  create: function (name, control) {
    return component.createT(component.cache[name], control);
  },
  scan: function (dom, control) {
    if (!dom) return null;
    if (!control) control = {};
    var elements = {}, templates = {};
    if (dom.length === 1) {
      component._searchDom(dom, elements, templates);
    } else {
      for (var i = 0, n = dom.length; i < n; i++) {
        component._searchDom($(dom[i]), elements, templates);
      }
    }
    control.self = dom;
    control.dom = elements;
    control.template = templates;
    return control;
  },
  empty: function (id) {
    var i, n, ch;
    ch = component.dom(id).children();
    n = ch.length;
    for (i=0; i<n; i++) {
      $(ch[i]).remove();
    }
  },
  view: function (control, id) {
    if (id) {
      component.empty(id);
      component.dom(id).append(control.self);
    } else {
      $(document.body).empty();
      $(document.body).append(control.self);
    }
  },
  dom: function (id) {
    return $('#' + id);
  }
};

if (!$win.$petal) $win.$petal = {};
$petal.ui = component;

})(window, document); // Module router

