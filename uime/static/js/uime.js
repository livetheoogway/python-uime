(function () {
    let activeGroupId = null;
    const sidebarLinkLookup = new Map();
    const activeSidebarLinks = new Map();
    let functionCards = [];
    let scrollRaf = null;

    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        initSidebarNav();
        initTabs();
        initScrollHighlighting();
        initJsonEditors();
        initForms();
        initCopyButtons();
        hydrateSwitches();
    });

    function initThemeToggle() {
        const root = document.documentElement;
        const toggle = document.querySelector('[data-theme-toggle]');
        const storedTheme = window.localStorage.getItem('uime-theme');
        const initialTheme = storedTheme || root.dataset.theme || 'dark';
        root.dataset.theme = initialTheme;

        const updateLabel = () => {
            if (!toggle) {
                return;
            }
            const next = root.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            toggle.setAttribute('aria-label', next);
        };

        updateLabel();

        toggle?.addEventListener('click', () => {
            const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            root.dataset.theme = nextTheme;
            window.localStorage.setItem('uime-theme', nextTheme);
            updateLabel();
        });
    }

    function initTabs() {
        const buttons = document.querySelectorAll('[data-tab-trigger]');
        const panels = document.querySelectorAll('[data-group-panel]');
        if (!buttons.length || !panels.length) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        let activeGroup = params.get('group');
        const hasGroup = activeGroup && document.getElementById(activeGroup);
        if (!hasGroup) {
            activeGroup = panels[0].id;
        }

        const activate = (group) => {
            panels.forEach(panel => {
                panel.classList.toggle('is-active', panel.id === group);
            });

            buttons.forEach(button => {
                const isActive = button.dataset.tabTrigger === group;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-selected', String(isActive));
            });

            activeGroupId = group;
            const firstLink = document.querySelector(`#${group} .sidebar-link`);
            if (firstLink) {
                setActiveSidebarLink(group, firstLink.dataset.func);
            }
            scheduleHighlightUpdate();

            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set('group', group);
            const query = searchParams.toString();
            const hash = window.location.hash;
            const nextUrl = query ? `${window.location.pathname}?${query}${hash}` : `${window.location.pathname}${hash}`;
            window.history.replaceState({}, '', nextUrl);
        };

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                activate(button.dataset.tabTrigger);
            });
        });

        activate(activeGroup);
    }

    function initSidebarNav() {
        const links = document.querySelectorAll('[data-scroll-to]');
        if (!links.length) {
            return;
        }

        links.forEach(link => {
            const group = link.dataset.group;
            const funcId = link.dataset.func;
            if (group && funcId) {
                sidebarLinkLookup.set(buildSidebarKey(group, funcId), link);
            }

            link.addEventListener('click', () => {
                const targetId = link.getAttribute('data-scroll-to');
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                if (group && funcId) {
                    setActiveSidebarLink(group, funcId);
                }
            });
        });
    }

    function initScrollHighlighting() {
        functionCards = Array.from(document.querySelectorAll('.function-card'));
        document.addEventListener('scroll', scheduleHighlightUpdate, { passive: true });
        window.addEventListener('resize', scheduleHighlightUpdate, { passive: true });
        scheduleHighlightUpdate();
    }

    function initForms() {
        document.querySelectorAll('[data-global-form]').forEach(form => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                saveGlobalVars(form);
            });
        });

        document.querySelectorAll('.function-form').forEach(form => {
            attachValidationHandling(form);
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                executeFunction(form);
            });
        });
    }

    function initJsonEditors() {
        document.querySelectorAll('[data-json-editor]').forEach(editor => {
            editor.setAttribute('spellcheck', 'false');
            if (editor.dataset.jsonEditor === 'dict') {
                editor.addEventListener('input', () => {
                    silentlyValidateJsonField(editor);
                });
            } else {
                editor.addEventListener('input', () => {
                    editor.setCustomValidity('');
                });
            }
        });
    }

    function initCopyButtons() {
        document.querySelectorAll('[data-copy-target]').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-copy-target');
                copyToClipboard(targetId);
            });
        });
    }

    function hydrateSwitches() {
        document.querySelectorAll('.switch').forEach(wrapper => {
            const input = wrapper.querySelector('.switch-input');
            const text = wrapper.querySelector('.switch-text');
            if (!input || !text) {
                return;
            }

            const sync = () => {
                text.textContent = input.checked ? 'True' : 'False';
            };

            input.addEventListener('change', sync);
            sync();
        });
    }

    function attachValidationHandling(form) {
        const handler = () => updateFormButtonState(form);
        form.addEventListener('input', handler);
        form.addEventListener('change', handler);
        updateFormButtonState(form);
    }

    function saveGlobalVars(form) {
        if (!validateJsonEditors(form)) {
            updateFormButtonState(form);
            return;
        }

        const formData = new FormData(form);
        const payload = {};
        formData.forEach((value, key) => {
            payload[key] = value;
        });

        fetch('/globals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(() => window.location.reload())
            .catch(error => {
                console.error('Error saving globals:', error);
            });
    }

    function executeFunction(form) {
        const group = form.dataset.group;
        const funcName = form.id.replace('-form', '');
        const resultPanel = document.getElementById(`${funcName}_section`);
        const resultElement = document.getElementById(`${funcName}_result`);
        const labelElement = resultPanel?.querySelector('[data-result-label]');
        const timeElement = resultPanel?.querySelector('[data-result-time]');
        const submitButton = form.querySelector('.primary-button');

        if (!group || !resultPanel || !resultElement) {
            return;
        }

        const formData = new FormData(form);
        const payload = {};
        formData.forEach((value, key) => {
            payload[key] = value;
        });

        setButtonLoading(submitButton, true);

        fetch(`/function/${encodeURIComponent(group)}/${funcName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(async (response) => {
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw data;
                }
                updateResultPanel(resultPanel, labelElement, timeElement, true);
                formatOutput(resultElement, data);
        })
            .catch((error) => {
                updateResultPanel(resultPanel, labelElement, timeElement, false);
                formatOutput(resultElement, normalizeErrorPayload(error));
            })
            .finally(() => {
                setButtonLoading(submitButton, false);
                updateFormButtonState(form);
            });
    }

    function updateResultPanel(panel, labelElement, timeElement, success) {
        panel.classList.remove('hidden', 'is-success', 'is-error');
        panel.classList.add(success ? 'is-success' : 'is-error');

        if (labelElement) {
            labelElement.textContent = success ? 'Success' : 'Error';
        }

        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString();
        }
    }

    function formatOutput(element, data) {
        if (data === null || data === undefined) {
            element.textContent = String(data);
            return;
        }

        if (typeof data === 'object') {
            const jsonString = JSON.stringify(data, null, 2);
            element.innerHTML = syntaxHighlight(jsonString);
            return;
        }

        if (typeof data === 'string') {
            const parsed = attemptParseJSON(data);
            if (parsed !== null) {
                const jsonString = JSON.stringify(parsed, null, 2);
                element.innerHTML = syntaxHighlight(jsonString);
            } else {
                element.textContent = data;
            }
            return;
        }

        element.textContent = String(data);
    }

    function syntaxHighlight(jsonString) {
        const escaped = jsonString
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? 'json-key' : 'json-string';
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
        });
    }

    function attemptParseJSON(value) {
        const trimmed = value.trim();
        if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) {
            return null;
        }
        try {
            return JSON.parse(trimmed);
        } catch {
            return null;
        }
    }

    function normalizeErrorPayload(error) {
        if (!error) {
            return { error: 'Execution failed' };
        }
        if (typeof error === 'object') {
            if (Object.keys(error).length === 0 && 'message' in error) {
                return { error: error.message };
            }
            return error;
        }
        if (typeof error === 'string') {
            return attemptParseJSON(error) ?? error;
        }
        return { error: String(error) };
    }

    function scheduleHighlightUpdate() {
        if (scrollRaf !== null) {
            return;
        }
        scrollRaf = window.requestAnimationFrame(() => {
            scrollRaf = null;
            updateActiveFunctionByScroll();
        });
    }

    function updateActiveFunctionByScroll() {
        if (!activeGroupId || !functionCards.length) {
            return;
        }
        const cards = functionCards.filter(card => card.dataset.group === activeGroupId);
        if (!cards.length) {
            return;
        }
        const viewportAnchor = 80;
        let candidate = null;
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            if (rect.bottom > viewportAnchor) {
                candidate = card;
                break;
            }
        }
        if (!candidate) {
            candidate = cards[cards.length - 1];
        }
        if (candidate) {
            setActiveSidebarLink(activeGroupId, candidate.dataset.func);
        }
    }

    function setActiveSidebarLink(group, funcId) {
        const link = sidebarLinkLookup.get(buildSidebarKey(group, funcId));
        if (!link) {
            return;
        }
        const previous = activeSidebarLinks.get(group);
        if (previous && previous !== link) {
            previous.classList.remove('is-active');
        }
        link.classList.add('is-active');
        activeSidebarLinks.set(group, link);
    }

    function buildSidebarKey(group, funcId) {
        return `${group}::${funcId}`;
    }

    function setButtonLoading(button, isLoading) {
        if (!button) {
            return;
        }
        button.classList.toggle('is-loading', isLoading);
        button.dataset.loading = isLoading ? 'true' : 'false';
        if (isLoading) {
            button.disabled = true;
        }
    }

    function updateFormButtonState(form) {
        const button = form.querySelector('.primary-button');
        if (!button || button.dataset.loading === 'true') {
            return;
        }
        button.disabled = !form.checkValidity();
    }

    function validateJsonEditors(form) {
        const editors = form.querySelectorAll('[data-json-editor="dict"]');
        for (const editor of editors) {
            if (!validateJsonField(editor)) {
                return false;
            }
        }
        return true;
    }

    function validateJsonField(editor) {
        const value = editor.value.trim();
        if (!value) {
            editor.setCustomValidity('JSON required');
            editor.reportValidity();
            return false;
        }
        try {
            JSON.parse(value);
            editor.setCustomValidity('');
            return true;
        } catch {
            editor.setCustomValidity('Invalid JSON');
            editor.reportValidity();
            return false;
        }
    }

    function silentlyValidateJsonField(editor) {
        const value = editor.value.trim();
        if (!value) {
            editor.setCustomValidity('');
            return;
        }
        try {
            JSON.parse(value);
            editor.setCustomValidity('');
        } catch {
            editor.setCustomValidity('Invalid JSON');
        }
    }

    function copyToClipboard(elementId) {
        const target = document.getElementById(elementId);
        if (!target) {
            return;
        }
        const text = target.innerText;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = text;
        tempTextArea.style.position = 'fixed';
        tempTextArea.style.opacity = '0';
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(tempTextArea);
        }
    }
})();
