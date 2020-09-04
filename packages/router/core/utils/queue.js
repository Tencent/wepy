/**
 * @desc
 * @author wudi@supermonkey.com.cn
 * @createDate 2019/11/14
 */

export default async function runQueue(queue, wrapperFn) {
  for (const item of queue) {
    item && await wrapperFn(item)
  }
}
