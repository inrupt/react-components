import React from 'react';
import { DataField } from '../../src/';
import { mount } from 'enzyme';
import { resolveLDflex } from '../../src/util';
import { mockPromise, update, setProps } from '../util';
import auth from 'solid-auth-client';

jest.mock('../../src/util');

describe('A DataField', () => {
  describe('without expression', () => {
    let field;
    beforeEach(async () => {
      field = mount(<DataField/>);
      await update(field);
    });
    afterEach(() => field.unmount());
    const span = () => field.find('span').first();

    it('is an empty span', () => {
      expect(span().name()).toBe('span');
      expect(span().text()).toBe('');
    });

    it('has the error message in the error property', () => {
      expect(span().prop('error'))
        .toBe('data should be an LDflex path or string but is undefined');
    });

    it('has the solid class', () => {
      expect(span().hasClass('solid')).toBe(true);
    });

    it('has the data class', () => {
      expect(span().hasClass('data')).toBe(true);
    });

    it('has the error class', () => {
      expect(span().hasClass('error')).toBe(true);
    });
  });

  describe('with a string expression', () => {
    let field, expression;
    beforeEach(() => {
      expression = mockPromise();
      resolveLDflex.mockReturnValue(expression);
      field = mount(<DataField data="user.firstname"/>);
    });
    afterEach(() => field.unmount());
    const span = () => field.find('span').first();

    describe('before the expression is evaluated', () => {
      it('is an empty span', () => {
        expect(span().name()).toBe('span');
        expect(span().text()).toBe('');
      });

      it('has the solid class', () => {
        expect(span().hasClass('solid')).toBe(true);
      });

      it('has the data class', () => {
        expect(span().hasClass('data')).toBe(true);
      });

      it('has the pending class', () => {
        expect(span().hasClass('pending')).toBe(true);
      });

      it('starts resolving the expression', () => {
        expect(resolveLDflex).toBeCalledTimes(1);
      });
    });

    describe('after the expression is evaluated', () => {
      beforeEach(async () => {
        await expression.resolve({ toString: () => 'contents' });
        field.update();
      });

      it('contains the resolved contents', () => {
        expect(field.text()).toBe('contents');
      });
    });

    describe('after the expression evaluates to undefined', () => {
      beforeEach(async () => {
        await expression.resolve(undefined);
        field.update();
      });

      it('is an empty span', () => {
        expect(span().name()).toBe('span');
        expect(span().text()).toBe('');
      });

      it('has the solid class', () => {
        expect(span().hasClass('solid')).toBe(true);
      });

      it('has the data class', () => {
        expect(span().hasClass('data')).toBe(true);
      });

      it('has the empty class', () => {
        expect(span().hasClass('empty')).toBe(true);
      });
    });

    describe('after the expression errors', () => {
      beforeEach(async () => {
        await expression.reject(new Error('the error message'));
        field.update();
      });

      it('is an empty span', () => {
        expect(span().name()).toBe('span');
        expect(span().text()).toBe('');
      });

      it('has the error message in the error property', () => {
        expect(span().prop('error')).toBe('the error message');
      });

      it('has the solid class', () => {
        expect(span().hasClass('solid')).toBe(true);
      });

      it('has the data class', () => {
        expect(span().hasClass('data')).toBe(true);
      });

      it('has the error class', () => {
        expect(span().hasClass('error')).toBe(true);
      });
    });

    describe('after the data changes', () => {
      let newExpression;
      beforeEach(async () => {
        newExpression = mockPromise();
        resolveLDflex.mockReturnValue(newExpression);
        await setProps(field, { data: 'user.other' });
      });

      describe('before the expression is evaluated', () => {
        it('starts resolving the expression', () => {
          expect(newExpression.then).toBeCalledTimes(1);
        });
      });

      describe('after the expression is evaluated', () => {
        beforeEach(async () => {
          await newExpression.resolve('new contents');
          field.update();
        });

        it('contains the resolved contents', () => {
          expect(field.text()).toBe('new contents');
        });
      });
    });

    describe('after the user changes', () => {
      beforeEach(() => auth.mockWebId('https://example.org/#me'));

      it('re-evaluates the expression', () => {
        expect(resolveLDflex).toBeCalledTimes(2);
      });
    });
  });

  describe('with a thenable', () => {
    let field, expression;
    beforeEach(() => {
      expression = mockPromise();
      field = mount(<DataField data={expression}/>);
    });
    afterEach(() => field.unmount());

    describe('after the user changes', () => {
      beforeEach(() => auth.mockWebId('https://example.org/#me'));

      it('does not re-evaluate the expression', () => {
        expect(expression.then).toBeCalledTimes(1);
      });
    });
  });
});
