/**
 * 按照顺序同步依次执行每个promise
 * 返回每次的结果组成的数组，每当有一个报错都会直接catch
 * @param values
 * @param shouldCatch
 * @return {Promise<any>}
 */
function syncPromiseCatch(values) {
  let response = []
  let idx = 0
  return new Promise((resolve, reject) => {
    (function next() {
      values[idx]().then((res) => {
        response.push(res)

        if (idx < (values.length - 1)) {
          idx++
          next()
        } else {
          resolve(response)
        }
      }).catch((e) => reject(e))
    })()
  })
}

function syncPromise(values) {
  let response = []
  let idx = 0

  if (values.length === 0)
    return Promise.resolve([])

  return new Promise((resolve, reject) => {
    (function next() {
      function thenPromise(res) {
        response.push(res)
        if (idx < (values.length - 1)) {
          idx++
          next()
        } else {
          resolve(response)
        }
      }
      values[idx]().then(thenPromise).catch(thenPromise)
    })()
  })
}

function delay(duration = 1000) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

function toSet(arr) {
  let set = new Set()
  for (let item of arr) {
    set.add(item)
  }
  return set
}

module.exports = {
  syncPromise,
  syncPromiseCatch,
  delay,
  toSet
}