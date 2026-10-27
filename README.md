# Menu Helper 🍜 菜单看不懂？拍一下就能点

## 为什么写这个

在国外吃饭，最尴尬的时刻往往不是开口说话，而是拿到菜单的那一分钟。

满页的菜名，每个单词你可能都认识，连起来就不知道端上来的是什么。Bruschetta 是面包还是沙拉？ねぎま里有没有葱？这跟语言水平关系不大，雅思 8.5 也照样看不懂。说实话，就算是中文菜单，"夫妻肺片""蚂蚁上树"第一次见也得猜半天。

然后服务员站在旁边等，你只好指着一行字说 "this one"，上菜之后才知道点了什么。

这个 prompt 是根据自己在外面吃饭的经历写的，目标很简单：**拍一下菜单，看懂每道菜，报几个数字，把手机递给服务员，就点完了。**

不用装 App，也不用注册。ChatGPT、Gemini、Claude、豆包，能看图的 AI 都能用。

## 用起来是这样的

**① 拍菜单**，它会按分类整理成一张表：

```
📍 居酒屋 とり吉 · JPY · 6 类 · 19 道

### 🍢 烤鸡串 焼き鳥（2本） · P1 左中
| # | 菜名 | 原文 | 口味 · 简介 | 价格 |
| 4 | 葱段鸡肉串 | ねぎま（タレ・塩） | 咸香 · 鸡腿肉夹大葱，酱汁/盐可选 | 420円 |
| 5 | 鸡肉丸串 | つくね | 甜咸 · 鸡肉末丸子烤 | 450円 |
```

每道菜有中文名、原文、口味、一句话简介和价格，标题里写着这一类在菜单上的位置，方便你对着找。

**② 回复编号**，比如 `4 5x2 14 不要葱`

如果有必须选的，比如拉面要大份还是普通、牛排几分熟、按公斤卖的要多重，它会先问清楚，不会替你猜。

**③ 确认，然后把手机递给服务员**

先给你一张中文确认清单，带价格和大概的人民币金额。下面是给服务员看的卡片：

```
━━━━━━━━━━━━━━━━
🙋 これを注文お願いします。
   We'd like to order these, please.

・ねぎま（塩） ×1
・つくね ×2
・豚骨ラーメン（大） ×1
   ネギ抜きでお願いします
━━━━━━━━━━━━━━━━
```

卡片上只有当地语言，服务员一眼就懂。如果你说过自己过敏，卡片第一行会请服务员帮忙确认食材。

再往下是一张常用语表：叫服务员、要水、不要辣、过敏、打包、结账、分开付、刷卡。每句都有当地语言、发音和英语。

**④ 吃到一半**
- 想加菜：`再加 8`，只出新加的那几道
- 想知道花了多少：`账单多少`
- 拿到小票：拍一下，逐行翻译，和你点的菜对一遍
- 菜单有好几页：接着拍，编号会接着往下排；换了一家店会自动清空重来，拿不准的时候它会问你一句

## 怎么用

**最简单的方式**：复制 [`prompt.md`](prompt.md) 全文，粘贴到 ChatGPT、Gemini 或豆包的新对话里发出去，然后发菜单照片。

**长期用**：
- **ChatGPT**：新建一个 GPT，把 `prompt.md` 全文粘贴进 Instructions（约 7200 字符，在 8000 字符限制内）。
- **Gemini**：新建 Gem，同样粘贴。
- **Claude**：把 `SKILL.md` 和 `prompt.md` 放进一个叫 `menu-helper` 的文件夹，压缩成 zip（zip 里顶层是 `menu-helper/`）。在 Settings 里打开 Code execution，然后在 Customize → Skills 上传。

## 它会老实告诉你的事

- 菜单上没写的菜和价格不会编；看不清的价格写 `?`，让你补拍那一块
- 只看菜名猜出来的简介会标「推测」
- 辣度、猪肉、海鲜这些图标只是参考，**过敏一定要跟服务员当面确认**
- 税、服务费、餐位费（比如日本的お通し、意大利的 coperto）只在菜单印了的时候提醒
- 人民币金额是约数

## 文件

| 文件 | 作用 |
|------|------|
| `prompt.md` | 全部规则 |
| `SKILL.md` | Claude Skill 入口 |
| `tests/menu_ja.png`、`tests/menu_it.png` | 测试菜单：日文居酒屋、意大利餐厅 |
| `tests/transcript_ja.md`、`tests/transcript_it.md` | 用测试菜单跑出的多轮对话 |

---

## English

Got a menu you can't read, even when you know every word on it? Send a photo and you get a numbered table: translated name, original name, taste, a one-line description and the price. Reply with numbers (`3 6 15x2`) and you get a confirmation list, a card in the local language to hand to the waiter, and phrases for ordering and paying.

No app, no server. Paste [`prompt.md`](prompt.md) into ChatGPT, Gemini or any AI that can see images. Or set it up as a Custom GPT, a Gem or a Claude Skill.

License: MIT
