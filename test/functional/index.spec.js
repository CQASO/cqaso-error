import Err from '../../src/index.js';

describe('cqaso-error', function() {
    it('should return right strusture data if call Err.error with "new Error" as argument', function() {
        let error;
        function a() {
            try {
                throw new Error('error message...')
            } catch (err) {
                error = Err.error(err);
                expect(error.msg).to.be.equal('error message...');
                expect(error.type).to.be.equal('catched');
            }
        }

        function b() {
            a();
        }
        b();
    })

    it('should return right strusture data if call reject in promise', function() {
        let error;
        function a() {
            new Promise(function(resolve, reject) {
                reject('error message...');
            }).catch(function(err) {
                error = Err.error(err);
                expect(error.msg).to.be.equal('error message...');
                expect(error.type).to.be.equal('catched');
            });
        }

        function b() {
            a();
        }
        b();
    })

    it('should fire a watch callback if error happen', function() {
        function a() {
            try {
                throw new Error('error message...')
            } catch (err) {
                Err.error(err);
            }
        }

        function b() {
            a();
        }

        const spyFunction = sinon.spy();
        Err.watch(spyFunction);
        b();
        sinon.assert.calledOnce(spyFunction);
        expect(spyFunction.args[0][0].msg).to.be.equal('error message...');
    })
});
