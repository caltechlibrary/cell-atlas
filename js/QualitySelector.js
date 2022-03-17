(function() {
    let MenuButton = videojs.getComponent("MenuButton");
    let MenuItem = videojs.getComponent("MenuItem");

    let QualityItem = videojs.extend(MenuItem, {

        constructor: function(player, options) {
            const quality = options.quality;

            options.label = `${quality}p`;
            options.selected = quality === "1080";
            options.selectable = true;
            options.multiSelectable = false;

            MenuItem.call(this, player, options);

            this.quality = quality;
            if(quality == "1080") {
                this.src = `https://www.cellstructureatlas.org/videos/${this.player().getAttribute("data-vid-name")}.mp4`;
            } else {
                this.src = `https://www.cellstructureatlas.org/videos/${this.player().getAttribute("data-vid-name")}_${quality}p.mp4`;
            }

            this.on(player, "loadstart", this.update);
        },

        createEl: function() {
            const el = MenuItem.prototype.createEl.call(this, event);

            this.selectedIcon_ = videojs.dom.createEl("span", {
                className: "vjs-icon-placeholder"
            });

            el.appendChild(this.selectedIcon_);

            return el;
        },

        handleClick: function(event) {
            MenuItem.prototype.handleClick.call(this, event);

            let player = this.player();
            let currentTime = player.currentTime();
            let paused = player.paused();

            player.one("loadedmetadata", function() {
                player.hasStarted(true);
                player.currentTime(currentTime);
                if(!paused) player.play(); 
            });

            player.src({ src: this.src, type: "video/mp4" });
        },

        update: function(event) {
            this.selected(this.player().src() == this.src);
        },

    });

    let QualityChanger = videojs.extend(MenuButton, {

        constructor: function(player, options) {
            MenuButton.call(this, player, options);

            this.menuButton_.el_.setAttribute('aria-describedby', this.labelElId_);

            this.on(player, "loadstart", this.updateLabel);
        },

        createEl: function() {
            const el = MenuButton.prototype.createEl.call(this);

            this.labelElId_ = "vjs-quality-value-label-" + this.id_;

            this.labelEl_ = videojs.dom.createEl("div", {
                className: "vjs-quality-value",
                id: this.labelElId_,
                textContent: "1080p"
            });

            let expandIcon = videojs.dom.createEl("span", {
                className: "vjs-icon-placeholder"
            }, {
                "aria-hidden": true
            });

            el.appendChild(this.labelEl_);
            el.appendChild(expandIcon);

            return el;
        },

        buildWrapperCSSClass: function() {
            return `vjs-quality-changer ${MenuButton.prototype.buildWrapperCSSClass.call(this)}`;
        },

        createItems: function() {
            let item1 = new QualityItem(this.player(), { quality: "1080" });
            let item2 = new QualityItem(this.player(), { quality: "480" });
            return [item1, item2];
        },

        updateLabel: function(e) {
            this.labelEl_.textContent = (this.player().src().includes("480p")) ? "480p" : "1080p";
        }
    });

    QualityChanger.prototype.controlText_ = "Quality";

    videojs.registerComponent("QualityChanger", QualityChanger);
})();