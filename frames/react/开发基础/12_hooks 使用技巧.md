# hook 使用技巧

## useCallback

使用场景：

1. 函数传递给子组件，防止组件不停更新，包裹一下
2. 作为 useEffect 依赖，防止更新陷入无限循环下
3. 自定义 hook 中返回的函数，使用 useCallback 包裹一下，因为不知道返回的函数，是怎么使用的。如果没有包裹，就会造成上面的两种情况。

## 自定义 hook

多思考使用 ref 来进行返回，保证地址不变
