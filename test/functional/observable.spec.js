const {observable, autorun} = require('../../src/observable.js');

describe('observable', () => {
    let obData;

    describe('test common object', () => {
        beforeEach(() => {
            obData = observable({
                name: 'rainie',
                id: '01'
            });
        })

        it('should return true if set getter', () => {
            const descriptor = Object.getOwnPropertyDescriptor(obData, 'name');
            expect(descriptor).to.have.property('get');
        })

        it('should call once if works with getters', () => {
            const spyFunction = sinon.spy(obData, 'name', ['get']);
            expect(obData.name).to.equal('rainie');
            expect(spyFunction.get.calledOnce).to.be.true;
            spyFunction.restore();
        })

        it('should set right value if works with setters', () => {
            const descriptor = Object.getOwnPropertyDescriptor(obData, 'name');
            expect(descriptor).to.have.property('set');
            obData.name = 'tom';
            expect(obData.name).to.equal('tom');
        })
    })

    describe('test nested object', () => {
        beforeEach(() => {
            obData = observable({
                data: {
                    name: 'rainie',
                    id: '01'
                }
            });
        })

        it ('should return true if set getter', () => {
            const descriptor = Object.getOwnPropertyDescriptor(obData.data, 'name');
            expect(descriptor).to.have.property('get');
        })

        it ('should call once if works with getters', () => {
            const spyFunction = sinon.spy(obData.data, 'name', ['get']);
            const temp = obData.data.name;
            expect(spyFunction.get.calledOnce).to.be.true;
            spyFunction.restore();
        })

        it ('should call parent\'s gettrer if get nested proptery', () => {
            const spyFunction = sinon.spy(obData, 'data', ['get']);
            const temp = obData.data.name;
            expect(spyFunction.get.calledOnce).to.be.true;
            spyFunction.restore();
        })

        it('should return right value if get nested proptery', () => {
            expect(obData.data.name).to.equal('rainie');
        })

        it('shoule works with setter', () => {
            obData.data.name = 'tom';
            expect(obData.data.name).to.equal('tom');
        })
    })
});



describe('autorun', () => {
    let obData;

    describe('test common object', () => {
        beforeEach(() => {
            obData = observable({
                name: 'rainie',
                id: '01'
            });
        })

        it('should call callback if call autorun', () => {
            const spyFunction = sinon.spy();
            autorun(spyFunction);
            sinon.assert.calledOnce(spyFunction);
        })

        it('should call not reevaluate callback when don\'t have observable object dependencies', () => {
            const spyFunction = sinon.spy();
            autorun(spyFunction);
            const temp = obData.name;
            sinon.assert.calledOnce(spyFunction);
        })

        it('should call reevaluate callback when one of observable object dependencies changes', () => {
            function log() {
                const temp = obData.name;
            }

            const spyFunction = sinon.spy(log);
            autorun(spyFunction);
            obData.name = 'tom';
            sinon.assert.calledTwice(spyFunction);
        })
    });

    describe('test nested object', () => {
        beforeEach(() => {
            obData = observable({
                data: {
                    name: 'rainie',
                    id: '01'
                }
            });
        })

        it('should call not reevaluate callback when don\'t have observable object dependencies', () => {
            const spyFunction = sinon.spy();
            autorun(spyFunction);
            const temp = obData.data.name;
            sinon.assert.calledOnce(spyFunction);
        })

        it('should call reevaluate callback when one of observable object dependencies changes', () => {
            function log() {
                const temp = obData.data.name;
            }

            const spyFunction = sinon.spy(log);
            autorun(spyFunction);
            obData.data.name = 'tom';
            sinon.assert.calledTwice(spyFunction);
        })
    });
})
