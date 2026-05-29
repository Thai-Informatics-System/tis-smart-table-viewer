
export const setToLocalStorageWithExpiry = (key: string, value: any, ttl = 9 * 1000 * 60 * 60) => {
    const now = new Date();
    // `item` is an object which contains the original value
    // as well as the time when it's supposed to expire
    const item = {
        value,
        expiry: now.getTime() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
};


export const getFromLocalStorageWithExpiry = (key: string) => {
    const itemStr = localStorage.getItem(key);
    // if the item doesn't exist, return null
    if (!itemStr) {
        return null;
    }
    // Guard against corrupt / non-JSON values (e.g. written by an older version
    // or other code). Treat an unparseable entry as missing and self-heal by
    // removing it, instead of throwing and breaking the caller (ngOnChanges).
    let item: any;
    try {
        item = JSON.parse(itemStr);
    } catch {
        localStorage.removeItem(key);
        return null;
    }
    const now = new Date();

    if (!item.expiry) {
        localStorage.removeItem(key);
        return null;
    }

    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage
        // and return null
        localStorage.removeItem(key);
        return null;
    }
    return item.value;
};

export const removeMultipleKeys = (keys: string[]) => {
    console.log('Storage Helper: Keys To Remove:', keys);
    keys.forEach(key => {
        localStorage.removeItem(key);
    });
}