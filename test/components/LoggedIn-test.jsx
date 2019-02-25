import React from 'react';
import { LoggedIn } from '../../src/';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import auth from 'solid-auth-client';

describe('A LoggedIn pane', () => {
  let pane;
  beforeEach(() => pane.update());

  describe('with children', () => {
    beforeAll(() => {
      pane = mount(<LoggedIn>Logged in</LoggedIn>);
    });
    afterAll(() => pane.unmount());

    describe('when the user is not logged in', () => {
      beforeAll(() => !act(() => {
        auth.mockWebId(null);
      }));

      it('is empty', () => {
        expect(pane.debug()).toBe('<LoggedIn />');
      });
    });

    describe('when the user is logged in', () => {
      beforeAll(() => !act(() => {
        auth.mockWebId('https://example.org/#me');
      }));

      it('renders the content', () => {
        expect(pane.debug()).toMatch(/Logged in/);
      });
    });
  });

  describe('without children', () => {
    beforeAll(() => !act(() => {
      pane = mount(<LoggedIn/>);
    }));
    afterAll(() => pane.unmount());

    describe('when the user is logged in', () => {
      beforeAll(() => !act(() => {
        auth.mockWebId('https://example.org/#me');
      }));

      it('is empty', () => {
        expect(pane.debug()).toBe('<LoggedIn />');
      });
    });
  });
});
