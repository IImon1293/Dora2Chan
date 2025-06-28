// ローカルストレージのキー
const STORAGE_KEY = 'doraemon_bbs_posts';
const THREAD_INFO_KEY = 'doraemon_bbs_thread_info';
const SESSION_KEY = 'doraemon_bbs_session';

// 初期投稿データ
const initialPosts = [
    {
        number: 2,
        name: "774号室の住人",
        email: "sage",
        date: "2025/06/28(土) 12:05:23.45",
        id: "doraemon002",
        content: "どこでもドアよりもタイムマシンの方が欲しいな\n過去の失敗をやり直したい..."
    },
    {
        number: 3,
        name: "名無しの四次元ポケット",
        email: "",
        date: "2025/06/28(土) 12:10:15.67",
        id: "doraemon003",
        content: ">>2\nタイムパラドックスが怖くない？\nでも確かに魅力的だよな"
    },
    {
        number: 4,
        name: "ジャイアンの妹",
        email: "sage",
        date: "2025/06/28(土) 12:15:42.89",
        id: "doraemon004",
        content: "私はスモールライトが欲しい！\n収納問題が全部解決するじゃん\n引っ越しも楽になるし"
    },
    {
        number: 5,
        name: "元のび太",
        email: "",
        date: "2025/06/28(土) 12:20:30.12",
        id: "doraemon005",
        content: "暗記パンがあれば人生変わってたと思う\nでも食べ過ぎてお腹壊すのがオチかｗ"
    }
];

// 投稿を取得
function getPosts() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    // 初回は初期データを保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPosts));
    return initialPosts;
}

// 投稿を保存
function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// スレッド情報を取得
function getThreadInfo() {
    const stored = localStorage.getItem(THREAD_INFO_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    // 初回はデフォルト値
    return {
        lastBumpTime: new Date().toISOString(),
        postCount: 5
    };
}

// スレッド情報を保存
function saveThreadInfo(info) {
    localStorage.setItem(THREAD_INFO_KEY, JSON.stringify(info));
}

// 投稿を表示
function renderPosts() {
    const container = document.getElementById('posts-container');
    const posts = getPosts();
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.id = `post-${post.number}`;
        
        const isSage = post.email.toLowerCase() === 'sage';
        
        const currentSessionId = getSessionId();
        const isOwnPost = post.sessionId === currentSessionId;
        const deleteButton = isOwnPost ? `<button class="delete-btn" onclick="deletePost(${post.number})" title="削除">×</button>` : '';
        
        postDiv.innerHTML = `
            <div class="post-header">
                <span class="post-number">${post.number}</span> ：
                <span class="post-name ${isSage ? 'sage' : ''}">${escapeHtml(post.name)}</span>：
                ${post.date} 
                <span class="post-id">ID:${post.id}</span>
                ${deleteButton}
            </div>
            <div class="post-content">${processContent(post.content)}</div>
        `;
        
        container.appendChild(postDiv);
    });
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// コンテンツの処理（アンカーリンクなど）
function processContent(content) {
    // 基本的なHTMLエスケープ
    let processed = escapeHtml(content);
    
    // アンカーリンクの処理 (>>番号)
    processed = processed.replace(/&gt;&gt;(\d+)/g, (match, num) => {
        return `<a href="#post-${num}" class="anchor-link" onclick="scrollToPost(${num}); return false;">&gt;&gt;${num}</a>`;
    });
    
    return processed;
}

// 特定の投稿にスクロール
function scrollToPost(number) {
    const element = document.getElementById(`post-${number}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // ハイライト効果
        element.style.backgroundColor = '#ffff99';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 2000);
    }
}

// 投稿を削除（所有者確認あり）
function deletePost(number) {
    const posts = getPosts();
    const post = posts.find(p => p.number === number);
    
    if (!post) {
        alert('投稿が見つかりません');
        return;
    }
    
    const currentSessionId = getSessionId();
    if (post.sessionId !== currentSessionId) {
        alert('この投稿は削除できません。自分の投稿のみ削除可能です。');
        return;
    }
    
    if (confirm(`投稿番号 ${number} を削除しますか？`)) {
        const index = posts.findIndex(p => p.number === number);
        if (index !== -1) {
            posts.splice(index, 1);
            savePosts(posts);
            renderPosts();
            updateThreadInfoDisplay();
        }
    }
}

// IDを生成
function generateId() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// セッションIDを取得（存在しない場合は生成）
function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = 'session_' + generateId() + '_' + Date.now();
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}

// 日時を取得
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];
    
    return `${year}/${month}/${day}(${weekday}) ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// フォームの処理
document.getElementById('new-post-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const contentInput = document.getElementById('content');
    
    const content = contentInput.value.trim();
    if (!content) return;
    
    const posts = getPosts();
    const threadInfo = getThreadInfo();
    const nextNumber = posts.length > 0 ? posts[posts.length - 1].number + 1 : 6;
    
    const emailValue = emailInput.value.trim();
    const isSage = emailValue.toLowerCase() === 'sage';
    
    const newPost = {
        number: nextNumber,
        name: nameInput.value.trim() || '名無しの四次元ポケット',
        email: emailValue || '',
        date: getCurrentDateTime(),
        id: 'doraemon' + generateId(),
        content: content,
        sessionId: getSessionId()
    };
    
    posts.push(newPost);
    savePosts(posts);
    
    // sage以外の投稿の場合はスレッドをage（浮上）させる
    if (!isSage) {
        threadInfo.lastBumpTime = new Date().toISOString();
    }
    threadInfo.postCount = nextNumber;
    saveThreadInfo(threadInfo);
    
    // フォームをクリア
    contentInput.value = '';
    
    // 再描画
    renderPosts();
    updateThreadInfoDisplay();
    
    // 新しい投稿にスクロール
    setTimeout(() => {
        scrollToPost(nextNumber);
    }, 100);
});

// スレッド情報を更新表示
function updateThreadInfoDisplay() {
    const threadInfo = getThreadInfo();
    const threadMetaElement = document.querySelector('.thread-meta');
    
    if (threadMetaElement) {
        // 最終age時刻を表示（sage投稿では更新されない）
        const lastBumpDate = new Date(threadInfo.lastBumpTime);
        const year = lastBumpDate.getFullYear();
        const month = String(lastBumpDate.getMonth() + 1).padStart(2, '0');
        const day = String(lastBumpDate.getDate()).padStart(2, '0');
        const hours = String(lastBumpDate.getHours()).padStart(2, '0');
        const minutes = String(lastBumpDate.getMinutes()).padStart(2, '0');
        const weekday = ['日', '月', '火', '水', '木', '金', '土'][lastBumpDate.getDay()];
        
        const formattedDate = `${year}/${month}/${day}(${weekday}) ${hours}:${minutes}`;
        
        // 既存のメタ情報をage情報で更新
        let bumpInfoElement = document.getElementById('bump-info');
        if (!bumpInfoElement) {
            bumpInfoElement = document.createElement('span');
            bumpInfoElement.id = 'bump-info';
            bumpInfoElement.style.cssText = 'display: block; font-size: 12px; color: #666; margin-top: 5px;';
            threadMetaElement.appendChild(bumpInfoElement);
        }
        bumpInfoElement.textContent = `最終age：${formattedDate} (レス数：${threadInfo.postCount})`;
    }
}

// 初期表示
document.addEventListener('DOMContentLoaded', () => {
    renderPosts();
    updateThreadInfoDisplay();
});