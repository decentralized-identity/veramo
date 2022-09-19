import { createList, StatusList } from "@digitalcredentials/vc-status-list"

/**
 * This tests if the status list 2021 library implements the standard correctly.
 * 
 * The standard says: 
 * ```Each verifiable credential is associated with a position in the list. 
 * If the binary value of the position in the list is 1 (one), the verifiable credential is revoked, 
 * if it is 0 (zero) it is not revoked.```
 * 
 * @see https://w3c-ccg.github.io/vc-status-list-2021/#conceptual-framework
 */
describe('@digitalcredentials/vc-status-list', () => {
    let index = 0;

    it(`Test status list 2021 library using index ${index}`, async () => {
        expect.assertions(3)

        let list = await createList({ length: 10000 });

        // Each index is initialized as `false`(not revoked)
        let status = list.getStatus(index);
        expect(status).toBeFalsy();

        // Revoking!
        list.setStatus(index, true);
        list = await StatusList.decode({ encodedList: await list.encode() });
        status = list.getStatus(index);
        expect(status).toBeTruthy();

        // Un-revoking!
        list.setStatus(index, false);
        list = await StatusList.decode({ encodedList: await list.encode() });
        status = list.getStatus(index);
        expect(status).toBeFalsy();
    });

    index = 5000;
    it(`Test status list 2021 library using index ${index}`, async () => {
        expect.assertions(3)

        let list = await createList({ length: 10000 });

        // Each index is initialized as `false`(not revoked)
        let status = list.getStatus(index);
        expect(status).toBeFalsy();

        // Revoking!
        list.setStatus(index, true);
        list = await StatusList.decode({ encodedList: await list.encode() });
        status = list.getStatus(index);
        expect(status).toBeTruthy();

        // Un-revoking!
        list.setStatus(index, false);
        list = await StatusList.decode({ encodedList: await list.encode() });
        status = list.getStatus(index);
        expect(status).toBeFalsy();
    });
});