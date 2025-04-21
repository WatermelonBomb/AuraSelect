(1)
#入力例
a = np.array([3, 8, 2, 6, 4, 4])
print(np.argmax(a))
# 出力例
# 1
#
#(2)
# 入力例
a = np.array([3, 8, 2, 6, 4, 4]).reshape(2, 3)
print(a)
print(np.argmax(a))
print(np.argmax(a, axis=1, keepdims=True))
print(np.expand_dims(np.argmax(a, axis=1), axis=1)) # 別解
# 出力例
# [[1],
#[0]]

#(3)
def toi3(a):
    max_value = np.min(a)
    ret = None
    for col in np.argmax(a, axis=1):
        for row in np.argmax(a, axis=0):
            if a[row,col] > max_value:
                max_value = a[row,col]
                ret = (row, col)
    return ret

# 入力例
a = np.array([3, 8, 2, 6, 4, 4]).reshape(2, 3)
print(f'最大値{np.max(a)}は{toi3(a)}成分にある。')
# 最大値8は(0, 1)成分にある
# 出力例
# (0, 1)