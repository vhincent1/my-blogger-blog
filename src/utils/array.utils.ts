/**
 * Filters out all properties except the specified
 * @param parameters
 * @param array
 * @returns The new array
 */
export async function filter(parameters: String, array: Array<any>): Promise<any> {
  const desiredProperties = parameters.split(',');
  return array.map((post) => {
    let newObj = {};
    for (const prop of desiredProperties) if (post.hasOwnProperty(prop)) newObj[prop] = post[prop];
    return newObj;
  });
}

/**
 * Excludes specified properties from an array
 * @param parameters
 * @param array
 * @returns The new array
 */
export async function truncate(parameters: String, array: Array<any>): Promise<any> {
  const excludedProperties = parameters.split(',');
  return array.map((key) => {
    const newItem = { ...key };
    excludedProperties.forEach((prop) => delete newItem[prop]);
    return newItem;
  });
}
/**
 * Removes empty objects
 * @param array
 */
async function clean(array) {
  return array.filter((key) => Object.keys(key).length > 0);
}
