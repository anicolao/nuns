{
  description = "Nuns on the Run: Node, Firebase emulators and browser verification";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs = { nixpkgs, ... }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ];
      each = nixpkgs.lib.genAttrs systems;
    in { devShells = each (system:
      let
        pkgs = import nixpkgs { inherit system; };
        browsers = pkgs.playwright-driver.selectBrowsers {
          withChromium = true; withChromiumHeadlessShell = true;
          withFirefox = false; withWebkit = false;
        };
      in { default = pkgs.mkShellNoCC {
        packages = with pkgs; [ nodejs_24 jdk21 git gh ripgrep browsers ];
        JAVA_HOME = "${pkgs.jdk21}";
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
        shellHook = ''
          export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="$(find -L ${browsers} -type f -name chrome-headless-shell -perm /111 | head -n 1)"
        '';
      }; }); };
}
