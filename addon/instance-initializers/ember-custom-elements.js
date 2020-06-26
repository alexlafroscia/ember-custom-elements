import Component from '@ember/component';
import { getCustomElements } from '../lib/common';
import { defer } from 'rsvp';
import { setupCustomElementFor } from '../index';

let INITIALIZATION_DEFERRED = defer();

export function getInitializationPromise() {
  return INITIALIZATION_DEFERRED.promise;
}

/**
 * Primarily looks up components that use the `@customElement` decorator
 * and evaluates them, allowing their custom elements to be defined.
 *
 * This does not touch custom elements defined for an Ember.Application.
 *
 * @param {Ember.ApplicationInstance} instance
 */
export function initialize(instance) {
  INITIALIZATION_DEFERRED = defer();

  // Get a list of all registered components, find the ones that use the customElement
  // decorator, and set the app instance and component name on them.
  for (const type of ['application', 'component', 'route']) {
    const entityNames = instance.__registry__.fallback.resolver.knownForType(type);
    for (const entityName in entityNames) {
      const klass = instance.resolveRegistration(entityName);
      const customElements = getCustomElements(klass);
      if (customElements.length > 0) {
        setupCustomElementFor(instance, entityName);
      }
    }
  }

  // Notify custom elements that Ember initialization is complete
  INITIALIZATION_DEFERRED.resolve();

  // Register a view that can be used to contain state for web component contents
  instance.register('component:-ember-web-component-view', Component.extend({ tagName: '' }));
}

export default {
  initialize
};
