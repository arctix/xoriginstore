describe('Tests for cross-doman storage api', function () {

    var sessionStore;

    beforeAll(function (done) {
        sessionStore = new XOriginSessionStore({
            receiverUrl: "http://localhost:9876/spec/spec-frame.html",
            mode: XOriginSessionStore.MODE_SENDER
        });
        //wait for the SpecRunner page to load
        setTimeout(function () {
            done();
        }, 500);
    });

    it('should set an item in storeage', function (done) {
        var key = 'keyForTheItem';
        var value = 'valueForTheItem';
        sessionStore.setItem(key, value);

        sessionStore.getItem(key, function (result) {
            expect(result).toEqual(value);
            done();
        });
    });

    it('should remove an item in storeage', function (done) {

        var key = 'keyForTheItem2';
        var value = 'valueForTheItem2';

        sessionStore.setItem(key, value);
        sessionStore.removeItem(key);

        sessionStore.getItem(key, function (result) {
            expect(result).toBeNull();
            done();
        });
    });


    it('should clear all items in storeage', function (done) {
        var key = 'keyForTheItem3';
        var value = 'valueForTheItem3';

        sessionStore.setItem(key, value);
        sessionStore.clear();

        sessionStore.getItem(key, function (result) {
            expect(result).toBeNull();
            done();
        });
    });

});