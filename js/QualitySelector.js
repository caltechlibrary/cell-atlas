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

            this.player().qualityChanger.changeQuality(this.quality);
        },

        update: function(event) {
            this.selected(this.player().qualityChanger.quality() == this.quality);
        },

    });

    let QualityChanger = videojs.extend(MenuButton, {

        constructor: function(player, options) {
            MenuButton.call(this, player, options);

            this.qualities_ = options.qualities;
            this.menuButton_.el_.setAttribute('aria-describedby', this.labelElId_);

            this.updateLabel();

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

            let labelWrapper = videojs.dom.createEl("div", {
                className: "vjs-quality-value-wrapper"
            });

            let expandIcon = videojs.dom.createEl("span", {
                className: "vjs-icon-placeholder"
            }, {
                "aria-hidden": true
            });


            labelWrapper.appendChild(this.labelEl_);
            labelWrapper.appendChild(expandIcon);
            el.appendChild(labelWrapper);

            return el;
        },

        buildWrapperCSSClass: function() {
            return `vjs-quality-changer ${MenuButton.prototype.buildWrapperCSSClass.call(this)}`;
        },

        createItems: function() {
            let qualities = []
            for(let quality of this.options().qualities) {
                qualities.push(new QualityItem(this.player(), quality));
            }
            return qualities;
        },

        updateLabel: function(e) {
            this.labelEl_.textContent = `${this.quality()}p`
        },

        changeQuality: function(requestedQuality) {
            let player = this.player();
            let currentTime = player.currentTime();
            let paused = player.paused();
            let src;

            if(this.quality() == requestedQuality) return;

            for(let quality of this.qualities_) {
                if(requestedQuality == quality.quality) src = quality.src;
            }

            player.one("loadedmetadata", function() {
                player.hasStarted(true);
                player.currentTime(currentTime);
                if(!paused) player.play(); 
            });
            
            player.src({ src, type: "video/mp4" });

            player.trigger("qualitychange");
        },

        quality: function() {
            for(let quality of this.qualities_) {
                if(this.player().src() == quality.src) return quality.quality;
            }
        }
    });

    QualityChanger.prototype.controlText_ = "Quality";

    videojs.registerComponent("QualityChanger", QualityChanger);
})();