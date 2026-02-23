# us_stock_extension
US Stock Checker for PeakFinder  

[米国株版銘柄チェッカー](https://chromewebstore.google.com/detail/%E7%B1%B3%E5%9B%BD%E6%A0%AA%E7%89%88%E9%8A%98%E6%9F%84%E3%83%81%E3%82%A7%E3%83%83%E3%82%AB%E3%83%BC/ldablobohcpnjbnljaopaojjmfoeaegf)

# 使い方
1. 拡張機能をダウンロードする  
https://github.com/ogalush/us_stock_extension/archive/refs/heads/main.zip  
→ ダウンロード後、zipファイルを解凍する。  

2. 拡張機能を入れる
```
Chrome 拡張のインストール方法:
1. chrome://extensions/ を開く
2. 画面右上のデベロッパーモードを有効化
3. 「パッケージ化されていない拡張機能を読み込む」を開く。
4. ダウンロードした「us_stock_extension」フォルダを選択する。
5. 拡張機能ウィンドウに「米国株版銘柄チェッカー0.1」が表示されればOK.
```
3. PeakFinderで銘柄を取得する  
4. 「右クリック」→ 「米国銘柄をマーキングする」を押す。  
<img width="235" height="583" alt="image" src="https://github.com/user-attachments/assets/3522218a-0e1d-47cf-9a28-d39012936bd6" />

5. ティッカーコードが黒い太字になるので、マウスポインタを合わせる。  
→ TradingViewの簡易版が表示される。  
<img width="425" height="416" alt="image" src="https://github.com/user-attachments/assets/60d4e819-608c-4903-a4ad-fcfcfbf6bcbb" />
  
6. TradingViewのiframeのウィンドウを移動させる場合  
→ ウィンドウ上のタイトルバーをドラッグする。  
<img width="680" height="134" alt="image" src="https://github.com/user-attachments/assets/eb542705-97ea-4e26-9e40-72f712401dc1" />
  
7. TradingViewのiframeのウィンドウの大きさ調整  
→ ウィンドウの右下にポインタを合わせて、ドラッグする。  
<img width="666" height="490" alt="image" src="https://github.com/user-attachments/assets/2687429d-242f-4623-9153-91c2609e2158" />
  
8. TradingViewのiframeのウィンドウの大きさを閉じる場合  
→ ウィンドウ右上の×を押す
  
# その他
## ChromeStoreの更新方法
### ローカルで開発する。
vscodeで編集、その後、Chomeブラウザで表示確認。

### パッケージング
提出用のzipファイルを用意する。  
 `manifest.json` が直下にあること。
```
% cd us_stock_extension_main
zip -vr ../us_stock_extension_main.zip . \
  -x "README.md" \
  -x ".git/*" \
  -x ".DS_Store"
```
### 審査へ提出
* [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) へログイン
```
•	Google アカウントでログイン
•	既存の拡張機能が一覧に表示される
```
* 「アイテムを更新」する
```
1.	対象の拡張をクリック
2.	［パッケージ］ or ［Store listing］画面へ
3.	「新しいパッケージをアップロード」
4.	v0.2 の ZIP をアップロード
```
* 審査用の変更内容を書く
変更内容を簡潔に記載する。
* プライバシー関連
個人情報は収集していないので、その旨記載。
* 審査に提出
「審査に送信」ボタンを押す。

### バージョンタグ付け
公開されたら、codefreezeさせるため、バージョンタグを付与する。
```
$ git clone git@github.com:ogalush/us_stock_extension.git
$ VER='v0.2'
$ git tag -a ${VER:?} -m "Release ${VER:?}
- Persist preview window position and size
- Improve iframe loading performance
- Add dark mode support"
$ git push origin ${VER:?}
```
修正をして改めてtag打ちしたい場合は、remote tagを削除して再度tag付与することで対応可能。
```
$ git push origin --delete ${VER:?}
```
以上
