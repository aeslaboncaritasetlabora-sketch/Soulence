let currentUser = null;
let currentUserData = null;
let localStream = null;
let isMuted = false;
let isCamOn = true;
let isBlocked = false;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let voiceTimer = null;
let voiceSeconds = 0;
let recordedAudioUrl = null;

// Realistic conversation AI
const realisticReplies = {
  greetings: [
    "Hey! 👋 Kamusta?", "Hi there! 😊", "Hello! Anong balita?", 
    "Uy, kamusta ka na? 👋", "Hii! 😄"
  ],
  howAreYou: [
    "Okay lang naman, ikaw? 😊", "Mabuti naman! Kumain ka na?", 
    "Ayos lang, busy lang sa work haha. Ikaw?", "Okay naman, salamat sa pagtanong! 💕"
  ],
  whatDoing: [
    "Nagre-relax lang dito, ikaw? 😌", "Nagtatrabaho pa rin huhu. You?", 
    "Netflix and chill lang haha, you?", "Kaka-uwi lang galing gym, ikaw?"
  ],
  compliments: [
    "Haha thank you! 😊", "Uy, kinikilig naman ako! 🙈", 
    "Ang sweet naman! 💕", "Haha stop it, you! 😄"
  ],
  flirty: [
    "Haha ang bold mo naman! 😜", "Uy, baka ma-fall ako ah! 😏", 
    "Haha grabe ka! 🙈", "Naku, bawal yan! Charot haha 😄"
  ],
  questions: [
    "Hmm, interesting question! 🤔", "Haha di ko pa napapag-isipan yan!", 
    "Gusto mo malaman? 😏", "Secret! Haha joke lang 😄"
  ],
  default: [
    "Haha really?", "Nice! 👍", "I see, I see! 👀", 
    "Grabe naman! 😄", "OMG! 😱", "Haha funny! 😂",
    "Wow, that's interesting! 🤔", "Tell me more! 👂", 
    "Haha grabe ka! 😜", "Aww, that's sweet! 🥰"
  ]
};

function getContextualReply(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.match(/^(hi|hello|hey|uy|hii)\b/)) {
    return realisticReplies.greetings[Math.floor(Math.random() * realisticReplies.greetings.length)];
  }
  if (lowerMsg.match(/(how are you|kamusta|musta|kumusta)/)) {
    return realisticReplies.howAreYou[Math.floor(Math.random() * realisticReplies.howAreYou.length)];
  }
  if (lowerMsg.match(/(what are you doing|anong ginagawa|busy ka)/)) {
    return realisticReplies.whatDoing[Math.floor(Math.random() * realisticReplies.whatDoing.length)];
  }
  if (lowerMsg.match(/(ganda|pogi|cute|ang ganda|ang pogi)/)) {
    return realisticReplies.compliments[Math.floor(Math.random() * realisticReplies.compliments.length)];
  }
  if (lowerMsg.match(/(miss you|i like you|crush|love you|date)/)) {
    return realisticReplies.flirty[Math.floor(Math.random() * realisticReplies.flirty.length)];
  }
  if (lowerMsg.match(/\?$/)) {
    return realisticReplies.questions[Math.floor(Math.random() * realisticReplies.questions.length)];
  }
  return realisticReplies.default[Math.floor(Math.random() * realisticReplies.default.length)];
}

document.addEventListener('DOMContentLoaded', () => {
  const views = {
    messages: document.getElementById('messages-view'),
    chat: document.getElementById('chat-view'),
    audioCall: document.getElementById('audio-call-overlay'),
    videoCall: document.getElementById('video-call-overlay')
  };

  // Emoji Modal - CENTER OF SCREEN
  const emojiModal = document.getElementById('emoji-modal');
  const emojiBtn = document.getElementById('btn-emoji');
  const closeEmojiBtn = document.getElementById('btn-close-emoji');
  const msgInput = document.getElementById('msgInput');
  
  emojiBtn.addEventListener('click', () => {
    emojiModal.classList.remove('hidden');
  });

  closeEmojiBtn.addEventListener('click', () => {
    emojiModal.classList.add('hidden');
  });

  emojiModal.addEventListener('click', (e) => {
    if (e.target === emojiModal) {
      emojiModal.classList.add('hidden');
    }
  });

  document.addEventListener('emoji-click', event => {
    if (event.detail && event.detail.unicode) {
      msgInput.value += event.detail.unicode;
      msgInput.focus();
      emojiModal.classList.add('hidden');
      msgInput.dispatchEvent(new Event('input'));
    }
  });

  // More Menu - NO LIKE OPTION
  const moreMenu = document.getElementById('more-menu');
  const btnMore = document.getElementById('btn-more');
  
  btnMore.addEventListener('click', (e) => {
    e.stopPropagation();
    moreMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#more-menu') && !e.target.closest('#btn-more')) {
      moreMenu.classList.add('hidden');
    }
  });

  // Block Function
  document.getElementById('menu-block').addEventListener('click', () => {
    isBlocked = true;
    document.getElementById('menu-block').classList.add('hidden');
    document.getElementById('menu-unblock').classList.remove('hidden');
    Swal.fire({ 
      title: 'Blocked!', 
      text: `You blocked ${currentUser}. They cannot message you anymore.`,
      icon: 'warning', 
      confirmButtonColor: '#ef4444' 
    });
    moreMenu.classList.add('hidden');
  });

  // Unblock Function
  document.getElementById('menu-unblock').addEventListener('click', () => {
    isBlocked = false;
    document.getElementById('menu-block').classList.remove('hidden');
    document.getElementById('menu-unblock').classList.add('hidden');
    Swal.fire({ 
      title: 'Unblocked!', 
      text: `You unblocked ${currentUser}. They can now message you.`,
      icon: 'success', 
      confirmButtonColor: '#22c55e' 
    });
    moreMenu.classList.add('hidden');
  });

  // Report Function
  document.getElementById('menu-report').addEventListener('click', () => {
    Swal.fire({
      title: 'Report User',
      input: 'select',
      inputOptions: {
        spam: 'Spam',
        inappropriate: 'Inappropriate Content',
        fake: 'Fake Profile',
        harassment: 'Harassment',
        other: 'Other'
      },
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Report'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Reported!', `You reported ${currentUser}. Thank you for keeping our community safe.`, 'success');
      }
    });
    moreMenu.classList.add('hidden');
  });

  // Clear Chat Function
  document.getElementById('menu-clear').addEventListener('click', () => {
    Swal.fire({
      title: 'Clear Chat?',
      text: 'This will delete all messages. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Clear',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        document.getElementById('chatBody').innerHTML = '<div class="chat-date">Today</div>';
        Swal.fire('Cleared!', 'Chat history has been deleted.', 'success');
      }
    });
    moreMenu.classList.add('hidden');
  });

  // Open chat
  document.querySelectorAll('.msg-item, .recent-item').forEach(item => {
    item.addEventListener('click', () => {
      const name = item.dataset.name;
      const avatar = item.dataset.avatar;
      currentUser = name;
      currentUserData = { name, avatar };
      
      document.getElementById('chat-name').textContent = name;
      document.getElementById('chat-avatar').src = avatar;
      
      // Reset block status
      isBlocked = false;
      document.getElementById('menu-block').classList.remove('hidden');
      document.getElementById('menu-unblock').classList.add('hidden');
      
      loadConversation(name, avatar);
      
      views.messages.classList.remove('active');
      views.chat.classList.add('active');
    });
  });

  function loadConversation(name, avatar) {
    const chatBody = document.getElementById('chatBody');
    chatBody.innerHTML = '<div class="chat-date">Today</div>';
    
    setTimeout(() => {
      const greeting = realisticReplies.greetings[Math.floor(Math.random() * realisticReplies.greetings.length)];
      addBubble('left', greeting, getCurrentTime(), avatar, false);
    }, 500);
  }

  function addBubble(side, text, time, avatar, save = true, isImage = false, isVoice = false, voiceUrl = null) {
    const chatBody = document.getElementById('chatBody');
    const bubble = document.createElement('div');
    bubble.className = `bubble ${side}`;
    
    const timeStr = time || getCurrentTime();
    
    let content = '';
    if (isImage) {
      content = `<img src="${text}" alt="Sent image" onclick="openImageModal('${text}')">`;
    } else if (isVoice && voiceUrl) {
      content = `
        <div class="voice-bubble" onclick="playVoiceMessage('${voiceUrl}', this)">
          <i class="fas fa-play"></i>
          <span>Voice Message</span>
          <i class="fas fa-microphone"></i>
        </div>
      `;
    } else {
      content = `<p>${escapeHtml(text)}</p>`;
    }
    
    if (side === 'left') {
      bubble.innerHTML = `
        <img class="bubble-avatar" src="${avatar || document.getElementById('chat-avatar').src}" alt="">
        <div class="bubble-content">
          ${content}
          <span class="bubble-time">${timeStr}</span>
        </div>
      `;
    } else {
      bubble.innerHTML = `
        <div class="bubble-content">
          ${content}
          <span class="bubble-time">${timeStr} ✓</span>
        </div>
      `;
    }
    
    chatBody.appendChild(bubble);
    bubble.scrollIntoView({ behavior: 'smooth' });
  }

  window.playVoiceMessage = (url, element) => {
    const audio = document.getElementById('voice-playback');
    const icon = element.querySelector('.fa-play, .fa-pause');
    
    if (audio.src === url && !audio.paused) {
      audio.pause();
      icon.className = 'fas fa-play';
      element.classList.remove('playing');
    } else {
      audio.src = url;
      audio.play();
      icon.className = 'fas fa-pause';
      element.classList.add('playing');
      
      audio.onended = () => {
        icon.className = 'fas fa-play';
        element.classList.remove('playing');
      };
    }
  };

  function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Back button
  document.getElementById('btn-back-chat').addEventListener('click', () => {
    views.chat.classList.remove('active');
    views.messages.classList.add('active');
    currentUser = null;
  });

  // ========== AUDIO CALL - FIXED ==========
  document.getElementById('btn-audio').addEventListener('click', () => {
    startAudioCall();
  });

  function startAudioCall() {
    const name = document.getElementById('chat-name').textContent;
    const avatar = document.getElementById('chat-avatar').src;
    
    document.getElementById('audio-call-name').textContent = name;
    document.getElementById('audio-call-avatar').src = avatar;
    document.getElementById('audio-call-status').textContent = 'Calling...';
    
    // Show calling state (Green + Red), hide connected state
    const callingState = document.getElementById('audio-calling-state');
    const connectedState = document.getElementById('audio-connected-state');
    
    callingState.style.display = 'flex';
    connectedState.style.display = 'none';
    
    views.audioCall.classList.add('active');
  }

  // Decline audio call
  document.getElementById('btn-audio-decline').addEventListener('click', () => {
    views.audioCall.classList.remove('active');
  });

  // Answer audio call - HIDE GREEN/RED, SHOW MIC/SPEAKER/END
  document.getElementById('btn-audio-answer').addEventListener('click', () => {
    const callingState = document.getElementById('audio-calling-state');
    const connectedState = document.getElementById('audio-connected-state');
    
    // HIDE calling buttons (Green/Red)
    callingState.style.display = 'none';
    // SHOW connected controls (Mic/Speaker/End)
    connectedState.style.display = 'flex';
    
    document.getElementById('audio-call-status').textContent = '00:00';
    startCallTimer('audio-call-status');
  });

  // ========== VIDEO CALL - FIXED ==========
  document.getElementById('btn-video').addEventListener('click', () => {
    startVideoCall();
  });

  async function startVideoCall() {
    const name = document.getElementById('chat-name').textContent;
    const avatar = document.getElementById('chat-avatar').src;
    
    document.getElementById('video-call-name').textContent = name;
    document.getElementById('video-call-avatar').src = avatar;
    document.getElementById('video-call-status').textContent = 'Calling...';
    
    // Show calling state (Green + Red), hide connected state
    const callingState = document.getElementById('video-calling-state');
    const connectedState = document.getElementById('video-connected-state');
    
    callingState.style.display = 'flex';
    connectedState.style.display = 'none';
    
    views.videoCall.classList.add('active');
    
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      document.getElementById('local-video').srcObject = localStream;
    } catch (err) {
      console.log('Camera access denied');
      document.getElementById('local-video').style.display = 'none';
    }
  }

  // Decline video call
  document.getElementById('btn-video-decline').addEventListener('click', () => {
    stopVideoCall();
  });

  // Answer video call - HIDE GREEN/RED, SHOW CONTROLS
  document.getElementById('btn-video-answer').addEventListener('click', () => {
    const callingState = document.getElementById('video-calling-state');
    const connectedState = document.getElementById('video-connected-state');
    
    // HIDE calling buttons (Green/Red)
    callingState.style.display = 'none';
    // SHOW connected controls (Mic/Cam/Flip/End)
    connectedState.style.display = 'flex';
    
    document.getElementById('video-call-status').textContent = '00:00';
    startCallTimer('video-call-status');
  });

  let callTimer = null;
  let callSeconds = 0;
  
  function startCallTimer(elementId) {
    callSeconds = 0;
    callTimer = setInterval(() => {
      callSeconds++;
      const mins = Math.floor(callSeconds / 60).toString().padStart(2, '0');
      const secs = (callSeconds % 60).toString().padStart(2, '0');
      document.getElementById(elementId).textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function stopCallTimer() {
    clearInterval(callTimer);
    callSeconds = 0;
  }

  // Audio call controls
  document.getElementById('btn-audio-mute').addEventListener('click', function() {
    isMuted = !isMuted;
    this.classList.toggle('muted');
    this.querySelector('i').className = isMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
    this.querySelector('span').textContent = isMuted ? 'Unmute' : 'Mute';
  });

  document.getElementById('btn-audio-speaker').addEventListener('click', function() {
    this.classList.toggle('active');
    this.querySelector('i').className = this.classList.contains('active') ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    this.querySelector('span').textContent = this.classList.contains('active') ? 'Earpiece' : 'Speaker';
  });

  document.getElementById('btn-audio-end').addEventListener('click', () => {
    stopCallTimer();
    views.audioCall.classList.remove('active');
    // Reset to calling state for next time
    document.getElementById('audio-calling-state').style.display = 'flex';
    document.getElementById('audio-connected-state').style.display = 'none';
    document.getElementById('btn-audio-mute').classList.remove('muted');
    document.getElementById('btn-audio-mute').querySelector('i').className = 'fas fa-microphone';
  });

  // Video call controls
  document.getElementById('btn-video-mute').addEventListener('click', function() {
    isMuted = !isMuted;
    this.classList.toggle('muted');
    this.querySelector('i').className = isMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
    
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
    }
  });

  document.getElementById('btn-video-cam').addEventListener('click', function() {
    isCamOn = !isCamOn;
    this.classList.toggle('cam-off');
    this.querySelector('i').className = isCamOn ? 'fas fa-video' : 'fas fa-video-slash';
    
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = isCamOn);
    }
    
    document.getElementById('local-video').classList.toggle('hidden', !isCamOn);
  });

  document.getElementById('btn-video-flip').addEventListener('click', () => {
    const localVideo = document.getElementById('local-video');
    localVideo.style.transform = localVideo.style.transform === 'scaleX(-1)' ? 'scaleX(1)' : 'scaleX(-1)';
  });

  function stopVideoCall() {
    stopCallTimer();
    views.videoCall.classList.remove('active');
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    
    // Reset to calling state for next time
    document.getElementById('video-calling-state').style.display = 'flex';
    document.getElementById('video-connected-state').style.display = 'none';
    
    isMuted = false;
    isCamOn = true;
    document.getElementById('btn-video-mute').classList.remove('muted');
    document.getElementById('btn-video-mute').querySelector('i').className = 'fas fa-microphone';
    document.getElementById('btn-video-cam').classList.remove('cam-off');
    document.getElementById('btn-video-cam').querySelector('i').className = 'fas fa-video';
    document.getElementById('local-video').classList.remove('hidden');
  }

  document.getElementById('btn-video-end').addEventListener('click', stopVideoCall);

  // Chat input
  const btnLike = document.getElementById('btn-like');
  const btnSend = document.getElementById('btn-send');
  const btnVoice = document.getElementById('btn-voice');

  msgInput.addEventListener('input', () => {
    const hasText = msgInput.value.trim().length > 0;
    btnLike.style.display = hasText ? 'none' : 'flex';
    btnVoice.style.display = hasText ? 'none' : 'flex';
    btnSend.style.display = hasText ? 'flex' : 'none';
  });

  document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (isBlocked) {
      Swal.fire('Blocked!', 'You blocked this user. Unblock them to send messages.', 'error');
      return;
    }
    
    const text = msgInput.value.trim();
    if (!text || !currentUser) return;

    addBubble('right', text, null, null, true);
    msgInput.value = '';
    btnLike.style.display = 'flex';
    btnVoice.style.display = 'flex';
    btnSend.style.display = 'none';

    // Realistic AI reply with typing indicator
    showTypingIndicator();
    
    setTimeout(() => {
      removeTypingIndicator();
      const avatar = document.getElementById('chat-avatar').src;
      const reply = getContextualReply(text);
      addBubble('left', reply, null, avatar, true);
    }, 1500 + Math.random() * 1500);
  });

  function showTypingIndicator() {
    const chatBody = document.getElementById('chatBody');
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.className = 'bubble left';
    typing.innerHTML = `
      <img class="bubble-avatar" src="${document.getElementById('chat-avatar').src}" alt="">
      <div class="bubble-content" style="padding: 12px 16px;">
        <div style="display: flex; gap: 4px; align-items: center;">
          <div style="width: 6px; height: 6px; background: #999; border-radius: 50%; animation: bounce 1s infinite;"></div>
          <div style="width: 6px; height: 6px; background: #999; border-radius: 50%; animation: bounce 1s infinite 0.2s;"></div>
          <div style="width: 6px; height: 6px; background: #999; border-radius: 50%; animation: bounce 1s infinite 0.4s;"></div>
        </div>
      </div>
    `;
    chatBody.appendChild(typing);
    typing.scrollIntoView({ behavior: 'smooth' });
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  btnLike.addEventListener('click', () => {
    if (currentUser && !isBlocked) {
      addBubble('right', '👍', null, null, true);
    }
  });

  // Voice Message Recording - ON RIGHT SIDE
  const voiceOverlay = document.getElementById('voice-overlay');
  const voiceTimerDisplay = document.getElementById('voice-timer');
  
  btnVoice.addEventListener('click', async () => {
    if (!currentUser || isBlocked) {
      if (isBlocked) Swal.fire('Blocked!', 'You blocked this user.', 'error');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        recordedAudioUrl = URL.createObjectURL(audioBlob);
        
        addBubble('right', '[Voice]', null, null, true, false, true, recordedAudioUrl);
        
        stream.getTracks().forEach(track => track.stop());
        
        setTimeout(() => {
          showTypingIndicator();
          setTimeout(() => {
            removeTypingIndicator();
            const avatar = document.getElementById('chat-avatar').src;
            const replies = [
              "Narinig ko na! 😊", "Ang ganda ng boses mo! 🎵", 
              "Haha ang cute ng voice mo!", "Nag-voice message ka pa, salamat! 💕"
            ];
            addBubble('left', replies[Math.floor(Math.random() * replies.length)], null, avatar, true);
          }, 1500);
        }, 1000);
      };
      
      mediaRecorder.start();
      isRecording = true;
      voiceSeconds = 0;
      voiceTimerDisplay.textContent = '0:00';
      voiceOverlay.classList.remove('hidden');
      
      voiceTimer = setInterval(() => {
        voiceSeconds++;
        const mins = Math.floor(voiceSeconds / 60);
        const secs = voiceSeconds % 60;
        voiceTimerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      }, 1000);
      
    } catch (err) {
      Swal.fire('Error', 'Could not access microphone', 'error');
    }
  });

  document.getElementById('btn-stop-voice').addEventListener('click', () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      clearInterval(voiceTimer);
      voiceOverlay.classList.add('hidden');
    }
  });

  // Gallery - Image Upload
  document.getElementById('btn-gallery').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file && currentUser && !isBlocked) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target.result;
          addBubble('right', imageUrl, null, null, true, true);
          
          setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
              removeTypingIndicator();
              const avatar = document.getElementById('chat-avatar').src;
              const replies = [
                "Ang ganda ng picture! 📸", "Nice photo! 😊", 
                "Haha, cute!", "Ganda naman! 💕", "Thanks for sharing! 👍"
              ];
              addBubble('left', replies[Math.floor(Math.random() * replies.length)], null, avatar, true);
            }, 1500);
          }, 500);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  });

  // Camera
  document.getElementById('btn-camera').addEventListener('click', async () => {
    if (!currentUser || isBlocked) {
      if (isBlocked) Swal.fire('Blocked!', 'You blocked this user.', 'error');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      
      const imageUrl = canvas.toDataURL('image/jpeg');
      track.stop();
      
      addBubble('right', imageUrl, null, null, true, true);
    } catch (err) {
      Swal.fire('Error', 'Could not access camera', 'error');
    }
  });

  // Image Modal
  window.openImageModal = (src) => {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-image');
    img.src = src;
    modal.classList.remove('hidden');
  };

  document.getElementById('btn-close-image').addEventListener('click', () => {
    document.getElementById('image-modal').classList.add('hidden');
  });

  document.getElementById('image-modal').addEventListener('click', (e) => {
    if (e.target.id === 'image-modal') {
      document.getElementById('image-modal').classList.add('hidden');
    }
  });

  // Search
  document.getElementById('btn-search').addEventListener('click', () => {
    Swal.fire({
      title: 'Search',
      input: 'text',
      inputPlaceholder: 'Search messages...',
      confirmButtonText: 'Search',
      confirmButtonColor: '#ec4899',
      showCancelButton: true
    });
  });

  // Bottom nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.classList.contains('match-item')) {
        this.querySelector('.match-icon').style.transform = 'scale(0.9)';
        setTimeout(() => {
          this.querySelector('.match-icon').style.transform = 'scale(1)';
        }, 150);
      } else {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });
});