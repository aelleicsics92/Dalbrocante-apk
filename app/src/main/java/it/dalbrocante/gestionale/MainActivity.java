package it.dalbrocante.gestionale;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JsResult;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {

    private static final String BASE = "https://gestiscoio.it";
    private static final String START_URL = BASE + "/login.php";
    private static final String HOST = "gestiscoio.it";
    private static final int REQ_FILE = 1001;
    // /dalbrocante/qualcosa.php  ->  cartella del negozio
    private static final Pattern SHOP_PATH = Pattern.compile("^/([^/]+)/[^/]+\\.php$");

    private WebView web;
    private LinearLayout barWrap;
    private ValueCallback<Uri[]> filePathCallback;
    private String fixJs = "";
    private SharedPreferences prefs;

    private int dp(int v) {
        return (int) (v * getResources().getDisplayMetrics().density + 0.5f);
    }

    private String loadAsset(String name) {
        try {
            InputStream in = getAssets().open(name);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[4096];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            in.close();
            return out.toString("UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

    private String homeUrl() {
        String folder = prefs.getString("folder", null);
        if (folder == null) return START_URL;
        return BASE + "/" + folder + "/dashboard.php";
    }

    private Button makeButton(String text, boolean primary) {
        Button b = new Button(this);
        b.setText(text);
        b.setAllCaps(false);
        b.setTextSize(16);
        b.setTypeface(Typeface.DEFAULT_BOLD);
        b.setMinHeight(0);
        b.setMinimumHeight(0);
        b.setPadding(dp(20), dp(12), dp(20), dp(12));
        if (Build.VERSION.SDK_INT >= 21) b.setStateListAnimator(null);
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(30));
        if (primary) {
            g.setOrientation(GradientDrawable.Orientation.LEFT_RIGHT);
            g.setColors(new int[]{Color.parseColor("#065f46"), Color.parseColor("#059669")});
            b.setTextColor(Color.WHITE);
        } else {
            g.setColor(Color.WHITE);
            g.setStroke(dp(2), Color.parseColor("#e5e7eb"));
            b.setTextColor(Color.parseColor("#374151"));
        }
        b.setBackground(g);
        return b;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        prefs = getSharedPreferences("app", MODE_PRIVATE);
        fixJs = loadAsset("fix.js");

        // ── Layout: web + barra in basso con Home ──
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#f8fafc"));

        web = new WebView(this);
        root.addView(web, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        barWrap = new LinearLayout(this);
        barWrap.setOrientation(LinearLayout.VERTICAL);
        barWrap.setBackgroundColor(Color.WHITE);
        barWrap.setVisibility(View.GONE);

        View divider = new View(this);
        divider.setBackgroundColor(Color.parseColor("#e5e7eb"));
        barWrap.addView(divider, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(1)));

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER);
        bar.setPadding(dp(12), dp(8), dp(12), dp(8));

        Button btnBack = makeButton("← Indietro", false);
        Button btnHome = makeButton("🏠  Home", true);

        LinearLayout.LayoutParams lpBack = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lpBack.rightMargin = dp(10);
        LinearLayout.LayoutParams lpHome = new LinearLayout.LayoutParams(
                0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        bar.addView(btnBack, lpBack);
        bar.addView(btnHome, lpHome);
        barWrap.addView(bar, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(barWrap, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        setContentView(root);

        btnHome.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { web.loadUrl(homeUrl()); }
        });
        btnBack.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                if (web.canGoBack()) web.goBack();
            }
        });

        // ── WebView ──
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setLoadWithOverviewMode(false);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= 21) cm.setAcceptThirdPartyCookies(web, true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                Uri u = req.getUrl();
                String scheme = u.getScheme() == null ? "" : u.getScheme();
                String host = u.getHost();
                boolean mine = (scheme.equals("http") || scheme.equals("https"))
                        && host != null && (host.equals(HOST) || host.endsWith("." + HOST));
                if (mine) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(MainActivity.this, "Impossibile aprire il link", Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @Override
            public void onPageStarted(WebView v, String url, android.graphics.Bitmap icon) {
                updateBar(url);
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                updateBar(url);
                if (fixJs.length() > 0) v.evaluateJavascript(fixJs, null);
                CookieManager.getInstance().flush();
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest req, WebResourceError err) {
                if (req.isForMainFrame()) {
                    String html = "<html><head><meta name='viewport' content='width=device-width,initial-scale=1'></head>"
                            + "<body style='font-family:sans-serif;text-align:center;padding:3rem 1rem;background:#f8fafc;color:#374151'>"
                            + "<h2>Connessione non disponibile</h2><p>Controlla internet e riprova.</p>"
                            + "<button style='padding:.9rem 1.6rem;border:0;border-radius:8px;background:#10b981;color:#fff;font-size:1rem;font-weight:600' "
                            + "onclick=\"location.href='" + START_URL + "'\">Riprova</button></body></html>";
                    v.loadDataWithBaseURL(START_URL, html, "text/html", "UTF-8", null);
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsAlert(WebView v, String url, String message, final JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                        .setMessage(message)
                        .setCancelable(false)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface d, int w) { result.confirm(); }
                        }).show();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView v, String url, String message, final JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                        .setMessage(message)
                        .setCancelable(false)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface d, int w) { result.confirm(); }
                        })
                        .setNegativeButton("Annulla", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface d, int w) { result.cancel(); }
                        }).show();
                return true;
            }

            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = cb;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        // PDF e file scaricati (TCPDF 'D')
        web.setDownloadListener(new android.webkit.DownloadListener() {
            @Override
            public void onDownloadStart(String url, String ua, String cd, String mime, long len) {
                try {
                    DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
                    r.addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url));
                    r.addRequestHeader("User-Agent", ua);
                    String name = URLUtil.guessFileName(url, cd, mime);
                    r.setMimeType(mime);
                    r.setTitle(name);
                    r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
                    ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(r);
                    Toast.makeText(MainActivity.this, "Download: " + name, Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Download non riuscito", Toast.LENGTH_LONG).show();
                }
            }
        });

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl(START_URL);
        }
    }

    // Mostra la barra Home solo dentro al gestionale (non nel login)
    private void updateBar(String url) {
        try {
            Uri u = Uri.parse(url);
            if (u.getHost() == null || !u.getHost().endsWith(HOST)) return;
            String p = u.getPath() == null ? "" : u.getPath();
            Matcher m = SHOP_PATH.matcher(p);
            if (m.matches()) {
                prefs.edit().putString("folder", m.group(1)).apply();
                barWrap.setVisibility(View.VISIBLE);
            } else if (p.equals("/login.php") || p.equals("/") || p.equals("")) {
                barWrap.setVisibility(View.GONE);
            }
        } catch (Exception ignored) { }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILE && filePathCallback != null) {
            filePathCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            filePathCallback = null;
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && web.canGoBack()) {
            web.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        CookieManager.getInstance().flush();
        super.onPause();
    }
}
