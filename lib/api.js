//Simulate DB :D
export const addOrder = async (order) => {

  console.log("adding order ", order, "To DB");

  await fetch("../api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });
};

export const hasPurchased = async (publicKey, itemID) => {

  // Send a GET request with the public key as a parameter
  const response = await fetch(`../api/orders?buyer=${publicKey.toString()}`);

  if (response.status === 200) {

    //Orders in json format
    const json = await response.json();
    console.log('Current wallets orders are: ', json)

    if (json.length > 0) {
      const order = json.find((order) => order.buyer === publicKey.toString && order.itemID === itemID)
      if (order) {
        return true
      }
    }
  }
  return false
}

export const fetchItem = async (itemID) => {
  const response = await fetch("../api/fetchItems", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itemID }),
  });
  const item = await response.json();
  return item;
}