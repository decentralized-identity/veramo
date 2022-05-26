import { canonicalize } from "json-canonicalize";

interface TypedDataField {
    name: string;
    type: string;
}

export function getEthTypesFromInputDoc(input: object, primaryType: string = "Document"): object {
    const res = getEthTypesFromInputDocHelper(input, primaryType);
    // if (!res.has("Proof")) {
    //     throw new Error("No proof was found on input document");
    // }
    let obj = Object.fromEntries(res);
    obj = { 
        // "EIP712Domain": [
        //     { name: "name", type: "string" },
        //     { name: "version", type: "string" },
        //     { name: "chainId", type: "uint256" },
        // ],
        ...obj
    };
    return obj;
}

// Given an Input Document, generate Types according to type generation algorithm specified in EIP-712 spec:
// https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/#ref-for-dfn-types-generation-algorithm-2
function getEthTypesFromInputDocHelper(input: object, primaryType: string): Map<string, TypedDataField[]> {
    const output = new Map<string, TypedDataField[]>();
    const types = new Array<TypedDataField>();

    let canonicalizedInput = JSON.parse(canonicalize(input));

    for (const property in canonicalizedInput) {
        const val = canonicalizedInput[property];
        const type = typeof val;
        if (type === "boolean") {
            types.push({ name: property, type: "bool" })
        } else if (type === "number" || type === "bigint") {
            types.push({ name: property, type: "uint256" })
        } else if (type === "string") {
            types.push({ name: property, type: "string" })
        } else if (type === "object") {
            if (Array.isArray(val)) {
                if (val.length === 0) {
                    throw new Error("Array with length 0 found")
                } else {
                    const arrayFirstType = typeof val[0];
                    if (arrayFirstType === "boolean" || arrayFirstType === "number" || arrayFirstType === "string") {
                        for (const arrayEntry in val) {
                            if (typeof arrayEntry !== arrayFirstType) {
                                throw new Error("Array with different types found");
                            }
                        }
                        if (arrayFirstType === "boolean") {
                            types.push({ name: property, type: "bool[]"});
                        } else if (arrayFirstType === "number") {
                            types.push({ name: property, type: "number[]"});
                        } else if (arrayFirstType === "string") {
                            types.push({ name: property, type: "string[]"});
                        }
                    } else {
                        throw new Error("Array with elements of unknown type found")
                    }
                }
            } else {
                const recursiveOutput = getEthTypesFromInputDocHelper(val, primaryType);
                const recursiveTypes = recursiveOutput.get(primaryType);
                const propertyType = property.charAt(0).toUpperCase() + property.substring(1);
                types.push({ name: property, type: propertyType });
                output.set(propertyType, recursiveTypes!);
                for (const key in recursiveOutput) {
                    if (key !== primaryType) {
                        output.set(key, recursiveOutput.get(key)!)
                    }
                }
            }

        } else {
            throw new Error("Bad Type Found in Input Document");
        }
    }

    output.set(primaryType, types);
    return output;
}