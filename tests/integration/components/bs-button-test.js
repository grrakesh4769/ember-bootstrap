import { run } from '@ember/runloop';
import { Promise as EmberPromise } from 'rsvp';
import { module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { test, defaultButtonClass } from '../../helpers/bootstrap-test';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | bs-button', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('button has correct default markup', async function(assert) {
    await render(hbs`{{#bs-button}}Test{{/bs-button}}`);

    assert.dom('button').hasClass('btn', 'button has btn class');
    assert.dom('button').hasClass(defaultButtonClass(), 'button has type class');
  });

  test('button has correct size', async function(assert) {
    await render(hbs`{{#bs-button size="lg"}}Test{{/bs-button}}`);

    assert.dom('button').hasClass('btn-lg', 'button has size class');
  });

  test('button has correct type', async function(assert) {
    await render(hbs`{{#bs-button type="primary"}}Test{{/bs-button}}`);

    assert.dom('button').hasClass('btn', 'button has btn class');
    assert.dom('button').hasClass('btn-primary', 'button has type class');
  });

  test('button can be active', async function(assert) {
    await render(hbs`{{#bs-button active=true}}Test{{/bs-button}}`);

    assert.dom('button').hasClass('active', 'button has active class');
  });

  test('button can be block', async function(assert) {
    await render(hbs`{{#bs-button block=true}}Test{{/bs-button}}`);

    assert.dom('button').hasClass('btn-block', 'button has block class');
  });

  test('button has HTML attributes', async function(assert) {
    await render(hbs`{{#bs-button id="test" disabled=true title="title"}}Test{{/bs-button}}`);

    assert.equal(this.element.querySelector('button').getAttribute('id'), 'test');
    assert.equal(this.element.querySelector('button').getAttribute('disabled'), '');
    assert.equal(this.element.querySelector('button').getAttribute('title'), 'title');
  });

  test('button has default label', async function(assert) {
    await render(hbs`{{bs-button defaultText="test"}}`);
    assert.dom('button').hasText('test');
  });

  test('button has default type "button"', async function(assert) {
    await render(hbs`{{bs-button}}`);
    assert.equal(this.element.querySelector('button').type, 'button');
  });

  test('buttonType property allows changing button type', async function(assert) {
    await render(hbs`{{bs-button buttonType="submit"}}`);
    assert.equal(this.element.querySelector('button').type, 'submit');
  });

  test('button with icon property shows icon', async function(assert) {
    await render(hbs`{{bs-button icon="fa fa-check"}}`);

    assert.dom('button i').hasClass('fa');
    assert.dom('button i').hasClass('fa-check');
  });

  test('button with iconActive and iconInactive properties shows icon depending on active state', async function(assert) {
    this.set('active', false);
    await render(hbs`{{bs-button active=active iconInactive="fa fa-plus" iconActive="fa fa-minus"}}`);

    assert.dom('button i').hasClass('fa');
    assert.dom('button i').hasClass('fa-plus');

    this.set('active', true);

    assert.dom('button i').hasClass('fa');
    assert.dom('button i').hasClass('fa-minus');

    this.set('active', false);

    assert.dom('button i').hasClass('fa');
    assert.dom('button i').hasClass('fa-plus');
  });

  test('clicking a button sends onClick action with "value" property as a parameter', async function(assert) {
    let action = this.spy();
    this.actions.testAction = action;
    await render(hbs`{{bs-button onClick=(action "testAction") value="dummy"}}`);

    await click('button');
    assert.ok(action.calledWith('dummy'), 'onClick action has been called with button value');
  });

  test('button text is changed according to button state', async function(assert) {

    await render(hbs`{{bs-button defaultText="text1" loadingText="text2" textState=textState}}`);
    assert.dom('button').hasText('text1');

    run(() => this.set('textState', 'loading'));

    assert.dom('button').hasText('text2');

    run(() => this.set('textState', 'default'));

    assert.dom('button').hasText('text1');
  });

  test('setting reset to true resets button state', async function(assert) {
    await render(hbs`{{bs-button defaultText="text1" loadingText="text2" textState=textState reset=reset}}`);
    run(() => this.set('textState', 'loading'));

    assert.dom('button').hasText('text2');

    run(() => this.set('reset', true));

    assert.dom('button').hasText('text1');
  });

  test('clicking a button sends onclick action, if promise is returned from closure action button state is changed according to promise state', async function(assert) {
    let promise, resolvePromise;

    this.actions.testAction = () => {
      promise = new EmberPromise(function(resolve) {
        resolvePromise = resolve;
      });
      return promise;
    };

    await render(
      hbs`{{bs-button onClick=(action "testAction") textState=textState defaultText="default" pendingText="pending" resolvedText="resolved" rejectedText="rejected"}}`
    );

    assert.expect(2);
    await click('button');
    assert.dom('button').hasText('pending');

    run(resolvePromise);

    assert.dom('button').hasText('resolved');

  });

  test('clicking a button with onClick action will prevent event to bubble up', async function(assert) {
    let buttonClick = this.spy();
    this.actions.buttonClick = buttonClick;
    let parentClick = this.spy();
    this.actions.parentClick = parentClick;

    await render(
      hbs`<div {{action "parentClick"}}>{{#bs-button onClick=(action "buttonClick")}}Button{{/bs-button}}</div>`
    );

    await click('button');
    assert.ok(buttonClick.called);
    assert.notOk(parentClick.called);
  });

  test('clicking a button without onClick action will cause event to bubble up', async function(assert) {
    let parentClick = this.spy();
    this.actions.parentClick = parentClick;

    await render(hbs`<div {{action "parentClick"}}>{{#bs-button}}Button{{/bs-button}}</div>`);

    await click('button');
    assert.ok(parentClick.called);
  });

  test('clicking a button with onClick action and bubble=true will cause event to bubble up', async function(assert) {
    let buttonClick = this.spy();
    this.actions.buttonClick = buttonClick;
    let parentClick = this.spy();
    this.actions.parentClick = parentClick;

    await render(
      hbs`<div {{action "parentClick"}}>{{#bs-button bubble=true onClick=(action "buttonClick")}}Button{{/bs-button}}</div>`
    );

    await click('button');
    assert.ok(buttonClick.called);
    assert.ok(parentClick.called);
  });
});
